import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseClient";
import { SignJWT } from "jose";

// const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"; // Make sure this is set in .env.local
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key"
);

export async function POST(request: Request) {
  const supabase = await createClient();
  try {
    // Parse request body
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    // Fetch user from database
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, email, password, role")
      .eq("email", email)
      .single();

    if (userError || !user) {
      console.error("User not found or error fetching user:", userError);
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Compare bcrypt-hashed password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      console.error("Password mismatch for user:", email);
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    if (user.role !== "admin") {
      return NextResponse.json(
        { message: "Access denied. Admins only." },
        { status: 403 }
      );
    }

    // Generate a token using jose
    const token = await new SignJWT({
      id: user.id,
      email: user.email,
      role: user.role,
    })
      .setProtectedHeader({ alg: "HS256" }) // Algorithm
      .setIssuedAt() // Set issue time
      .setExpirationTime("1h") // Token expires in 1 hour
      //.sign(new TextEncoder().encode(JWT_SECRET)); // Sign with secret key
      .sign(JWT_SECRET); // Sign with secret key

    // Set the token in a secure HttpOnly cookie

    const response = NextResponse.json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });

    response.cookies.set("token", token, {
      httpOnly: true, // Ensures the cookie cannot be accessed via JavaScript
      secure: process.env.NODE_ENV === "production", // Use HTTPS in production
      sameSite: "strict", // Prevents CSRF attacks
      maxAge: 60 * 60, // 1 hour
      path: "/", // Accessible across the entire app
    });

    return response;
  } catch (error: any) {
    console.error("Unexpected error:", error.message);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
