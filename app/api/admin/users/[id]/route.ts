import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseClient";
import { verifyToken } from "@/lib/verifyToken";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const authHeader = request.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ message: "Unauthorized: No Authorization header provided" }, { status: 401 });
  }

  const token = authHeader.split(" ")[1];
  const decoded = await verifyToken(token);

  if (!decoded) {
    return NextResponse.json({ message: "Unauthorized: Invalid token" }, { status: 401 });
  }

  // Ensure the requester is an admin
  if (decoded.role !== "admin") {
    return NextResponse.json({ message: "Access denied: Admins only" }, { status: 403 });
  }

  const { id } = params; // Extract the user ID from the route
  if (!id) {
    return NextResponse.json({ message: "User ID is required" }, { status: 400 });
  }

  const supabase = await createClient();

  try {
    const { data: user, error } = await supabase
      .from("users")
      .select("id, email, role")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching user:", error);
      return NextResponse.json({ message: "Error fetching user" }, { status: 500 });
    }

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}