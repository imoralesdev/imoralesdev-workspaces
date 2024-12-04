/*
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseClient";
import { verifyToken } from "@/lib/verifyToken";

export async function GET(request: Request) {
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

  const supabase = await createClient();

  try {
    const { data: users, error } = await supabase
      .from("users")
      .select("id, email, role");

    if (error) {
      console.error("Error fetching users:", error);
      return NextResponse.json({ message: "Error fetching users" }, { status: 500 });
    }

    return NextResponse.json({ users }, { status: 200 });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
*/

import { NextResponse } from "next/server";
import { cookies } from "next/headers"; // Import cookies helper
import { createClient } from "@/lib/supabaseClient";
import { verifyToken } from "@/lib/verifyToken";

export async function GET(request: Request) {
  // Access cookies using the cookies() helper (await required)
  const cookiesInstance = await cookies();
  const token = cookiesInstance.get("token")?.value;

  if (!token) {
    return NextResponse.json(
      { message: "Unauthorized: No token provided" },
      { status: 401 }
    );
  }

  const decoded = await verifyToken(token);

  if (!decoded) {
    return NextResponse.json(
      { message: "Unauthorized: Invalid or expired token" },
      { status: 401 }
    );
  }

  // Ensure the requester is an admin
  if (decoded.role !== "admin") {
    return NextResponse.json(
      { message: "Access denied: Admins only" },
      { status: 403 }
    );
  }

  const supabase = await createClient();

  try {
    const { data: users, error } = await supabase
      .from("users")
      .select("id, email, role");

    if (error) {
      console.error("Error fetching users:", error);
      return NextResponse.json(
        { message: "Error fetching users" },
        { status: 500 }
      );
    }

    return NextResponse.json({ users }, { status: 200 });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}