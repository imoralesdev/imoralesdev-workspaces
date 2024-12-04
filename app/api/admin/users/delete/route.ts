import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseClient";
import { verifyToken } from "@/lib/verifyToken";

export const POST = async (request: Request) => {
  const authHeader = request.headers.get("Authorization");
  const { id } = await request.json();

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.split(" ")[1];
  const decoded = await verifyToken(token);

  if (!decoded) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // Ensure the requester is an admin
  if (decoded.role !== "admin") {
    return NextResponse.json({ message: "Access denied. Admins only." }, { status: 403 });
  }

  // Validate the request body
  if (!id) {
    return NextResponse.json({ message: "User ID is required" }, { status: 400 });
  }

  const supabase = await createClient();

  try {
    // Delete the user from the database
    const { error: deleteError } = await supabase
      .from("users")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Error deleting user:", deleteError);
      return NextResponse.json({ message: "Error deleting user" }, { status: 500 });
    }

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
};