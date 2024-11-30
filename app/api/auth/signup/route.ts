import { NextResponse } from "next/server";
import { generateToken } from "@/lib/auth";
import { getUsersCollection } from "@/lib/db/mongodb";
import bcrypt from "bcryptjs";
import { DBUser } from "@/lib/db/schemas";

export async function POST(request: Request) {
  try {
    const { username, password, role = "user" } = await request.json();
    const collection = await getUsersCollection();

    // Check if user exists
    const existingUser = await collection.findOne({ username });
    if (existingUser) {
      return NextResponse.json(
        { error: "Username already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const result = await collection.insertOne({
      username,
      password: hashedPassword,
      role,
    } as DBUser);

    const token = generateToken({
      id: result.insertedId.toString(),
      username,
      role,
    });

    return NextResponse.json({
      token,
      user: {
        id: result.insertedId.toString(),
        username,
        role,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
