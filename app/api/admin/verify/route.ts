import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key");

export const POST = async () => {
  // Use `await` to resolve the cookies Promise
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    // Verify the JWT token
    const { payload } = await jwtVerify(token, JWT_SECRET);

    return NextResponse.json({
      message: "Authorized",
      user: {
        id: payload.id,
        email: payload.email,
        role: payload.role,
      },
    });
  } catch (err) {
    console.error("JWT verification failed:", err);
    return NextResponse.json({ message: "Invalid or expired token" }, { status: 401 });
  }
};
