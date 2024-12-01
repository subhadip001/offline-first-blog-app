import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getCommentsCollection } from "@/lib/db/mongodb";
import type { DBComment } from "@/lib/db/schemas";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string | string[] | undefined }> }
) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { content } = await request.json();

    if (!content?.trim()) {
      return NextResponse.json(
        { error: "Comment content is required" },
        { status: 400 }
      );
    }

    const collection = await getCommentsCollection();

    const id = (await params).id;

    const comment: Omit<DBComment, "_id"> = {
      postId: new ObjectId(id as string),
      content: content.trim(),
      authorId: new ObjectId(userId),
      createdAt: new Date(),
      version: 1,
    } as DBComment;

    const result = await collection.insertOne(comment as DBComment);
    const insertedComment = await collection.findOne({
      _id: result.insertedId,
    });

    return NextResponse.json({
      comment: {
        ...insertedComment,
        id: insertedComment?._id.toString(),
        postId: insertedComment?.postId.toString(),
        authorId: insertedComment?.authorId.toString(),
        _id: undefined,
      },
    });
  } catch (error) {
    console.error("Failed to create comment:", error);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string | string[] | undefined }> }
) {
  try {
    const id = (await params).id;
    const commentId = request.nextUrl.searchParams.get("commentId");
    if (!commentId) {
      return NextResponse.json(
        { error: "Comment ID is required" },
        { status: 400 }
      );
    }

    const userId = request.headers.get("x-user-id");
    const userRole = request.headers.get("x-user-role");

    const collection = await getCommentsCollection();
    const comment = await collection.findOne({
      _id: new ObjectId(commentId),
      postId: new ObjectId(id as string),
    });

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    if (userRole !== "admin" && comment.authorId.toString() !== userId) {
      return NextResponse.json(
        { error: "Unauthorized to delete this comment" },
        { status: 403 }
      );
    }

    await collection.deleteOne({ _id: new ObjectId(commentId) });

    return NextResponse.json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    console.error("Failed to delete comment:", error);
    return NextResponse.json(
      { error: "Failed to delete comment" },
      { status: 500 }
    );
  }
}
