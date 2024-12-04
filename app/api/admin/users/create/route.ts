import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseClient";
import { verifyToken } from "@/lib/verifyToken";
import bcrypt from "bcrypt";

const VALID_ROLES = ["admin", "editor", "viewer"]; // Define valid roles

export const POST = async (request: Request) => {
  const authHeader = request.headers.get("Authorization");
  const { email, password, role } = await request.json();

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

  // Validate input fields
  if (!email || !password || !role) {
    return NextResponse.json({ message: "Email, password, and role are required" }, { status: 400 });
  }

  if (!VALID_ROLES.includes(role)) {
    return NextResponse.json({ message: `Invalid role. Valid roles are: ${VALID_ROLES.join(", ")}` }, { status: 400 });
  }

  const supabase = await createClient();

  // Check if a user with the same email already exists
  const { data: existingUser, error: fetchError } = await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .single();

  if (fetchError && fetchError.code !== "PGRST116") {
    console.error("Error fetching existing user:", fetchError);
    return NextResponse.json({ message: "Error checking for existing user" }, { status: 500 });
  }

  if (existingUser) {
    return NextResponse.json({ message: "A user with this email already exists" }, { status: 400 });
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create the user
  const { data, error: insertError } = await supabase
    .from("users")
    .insert([{ email, password: hashedPassword, role }])
    .select();

  if (insertError) {
    console.error("Error creating user:", insertError);
    return NextResponse.json({ message: "Error creating user" }, { status: 500 });
  }

  return NextResponse.json({ message: "User created successfully", user: data });
};