import jwt from "jsonwebtoken";
import { User } from "./db/schemas";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export function generateToken(user: Omit<User, "password">) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: "24h" }
  );
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as Omit<User, "password">;
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
