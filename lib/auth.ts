import { SignJWT, jwtVerify } from "jose";
import { User } from "./db/schemas";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key"
);

export async function generateToken(user: Omit<User, "password">) {
  const token = await new SignJWT({
    id: user.id,
    username: user.username,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("24h")
    .sign(JWT_SECRET);

  return token;
}

export async function verifyToken(token: string) {
  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    return verified.payload as Omit<User, "password">;
  } catch {
    return null;
  }
}

export function getTokenFromHeader(authHeader?: string) {
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.split(" ")[1];
}
