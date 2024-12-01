import { NextRequest, NextResponse } from "next/server";
import { getUsersCollection } from "@/lib/db/mongodb";
import { ObjectId } from "mongodb";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const usersCollection = await getUsersCollection();

    const query = ObjectId.isValid(userId)
      ? { _id: new ObjectId(userId) }
      : { userId: userId };

    const user = await usersCollection.findOne(query, {
      projection: {
        username: 1,
        role: 1,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
