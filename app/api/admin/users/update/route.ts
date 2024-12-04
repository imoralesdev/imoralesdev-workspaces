import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseClient";
import { verifyToken } from "@/lib/verifyToken";

export const POST = async (request: Request) => {
  const authHeader = request.headers.get("Authorization");
  const { id, role } = await request.json();

  // Check for Authorization header and token
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.error("No token provided or malformed Authorization header.");
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.split(" ")[1];
  console.log("Extracted Token:", token);

  try {
    // Verify the token using verifyToken
    const decoded = await verifyToken(token);

    if (!decoded) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Ensure the user is an admin
    if (decoded.role !== "admin") {
      return NextResponse.json({ message: "Access denied. Admins only." }, { status: 403 });
    }

    // Validate input fields
    if (!id || !role) {
      return NextResponse.json({ message: "User ID and role are required" }, { status: 400 });
    }

    const supabase = await createClient();

    // Update the user's role
    const { error: updateError } = await supabase
      .from("users")
      .update({ role })
      .eq("id", id);

    if (updateError) {
      console.error("Error updating user role:", updateError);
      return NextResponse.json({ message: "Error updating user role" }, { status: 500 });
    }

    return NextResponse.json({ message: "User role updated successfully" });
  } catch (err) {
    console.error("JWT verification failed or other error:", err);
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
};