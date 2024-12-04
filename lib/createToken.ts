import { SignJWT, JWTPayload } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key");

export async function createToken(payload: JWTPayload): Promise<string> {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" }) // Algorithm to use
    .setIssuedAt() // Current timestamp
    .setExpirationTime("15m") // Short expiration time
    .sign(JWT_SECRET); // Sign the token
  return token;
}