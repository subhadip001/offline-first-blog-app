import { NextResponse } from "next/server";
import { generateToken } from "@/lib/auth";
import { getUsersCollection } from "@/lib/db/mongodb";
import { DBUser } from "@/lib/db/schemas";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    const collection = await getUsersCollection();
    const user = await collection.findOne({ username });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const token = generateToken({
      id: user._id.toString(),
      username: user.username,
      role: user.role,
    });

    return NextResponse.json({
      token,
      user: {
        id: user._id.toString(),
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper API to create a test user (remove in production)
export async function PUT(request: Request) {
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

    // Create user
    const result = await collection.insertOne({
      username,
      password: hashedPassword,
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as DBUser);

    return NextResponse.json({
      success: true,
      userId: result.insertedId.toString(),
    });
  } catch (error) {
    console.error("Create user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
