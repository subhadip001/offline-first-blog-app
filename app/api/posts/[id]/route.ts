import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getPostsCollection, getCommentsCollection } from "@/lib/db/mongodb";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const collection = await getPostsCollection();
    const post = await collection.findOne({ _id: new ObjectId(params.id) });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({
      post: {
        ...post,
        id: post._id.toString(),
        _id: undefined,
      },
    });
  } catch (error) {
    console.error("Failed to fetch post:", error);
    return NextResponse.json(
      { error: "Failed to fetch post" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get("x-user-id");
    const userRole = request.headers.get("x-user-role");

    const collection = await getPostsCollection();
    const post = await collection.findOne({ _id: new ObjectId(params.id) });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Check if user has permission to update
    if (userRole !== "admin" && post.authorId.toString() !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const json = await request.json();
    const { title, content, version } = json;

    // Implement Last-Write-Wins conflict resolution
    if (version && version < post.version) {
      return NextResponse.json(
        {
          error: "Conflict: newer version exists",
          serverVersion: post.version,
        },
        { status: 409 }
      );
    }

    const update = {
      $set: {
        ...(title && { title }),
        ...(content && { content }),
        updatedAt: new Date(),
        version: (post.version || 0) + 1,
      },
    };

    await collection.updateOne({ _id: new ObjectId(params.id) }, update);

    const updatedPost = await collection.findOne({
      _id: new ObjectId(params.id),
    });

    return NextResponse.json({
      post: {
        ...updatedPost,
        id: updatedPost?._id.toString(),
        _id: undefined,
      },
    });
  } catch (error) {
    console.error("Failed to update post:", error);
    return NextResponse.json(
      { error: "Failed to update post" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get("x-user-id");
    const userRole = request.headers.get("x-user-role");

    const collection = await getPostsCollection();
    const post = await collection.findOne({ _id: new ObjectId(params.id) });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Check if user has permission to delete
    if (userRole !== "admin" && post.authorId.toString() !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await collection.deleteOne({ _id: new ObjectId(params.id) });

    // Also delete associated comments
    const commentsCollection = await getCommentsCollection();
    await commentsCollection.deleteMany({ postId: new ObjectId(params.id) });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete post:", error);
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 }
    );
  }
}
