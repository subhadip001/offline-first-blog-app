import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getPostsCollection, getCommentsCollection } from "@/lib/db/mongodb";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string | string[] | undefined }> }
) {
  try {
    const id = (await params).id;
    const collection = await getPostsCollection();
    const post = await collection.findOne({ _id: new ObjectId(id as string) });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Get comments for this post
    const commentsCollection = await getCommentsCollection();
    const comments = await commentsCollection
      .find({ postId: new ObjectId(id as string) })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      post: {
        ...post,
        id: post._id.toString(),
        authorId: post.authorId.toString(),
        _id: undefined,
      },
      comments: comments.map((comment) => ({
        ...comment,
        id: comment._id.toString(),
        postId: comment.postId.toString(),
        authorId: comment.authorId.toString(),
        _id: undefined,
      })),
    });
  } catch (error) {
    console.error("Failed to fetch post:", error);
    return NextResponse.json(
      { error: "Failed to fetch post" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string | string[] | undefined }> }
) {
  try {
    const id = (await params).id;
    const userId = request.headers.get("x-user-id");
    const userRole = request.headers.get("x-user-role");

    const collection = await getPostsCollection();
    const post = await collection.findOne({ _id: new ObjectId(id as string) });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Check if user has permission to update
    if (userRole !== "admin" && post.authorId.toString() !== userId) {
      return NextResponse.json(
        { error: "Unauthorized to edit this post" },
        { status: 403 }
      );
    }

    const json = await request.json();
    const { title, content } = json;

    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    const update = {
      $set: {
        title: title.trim(),
        content: content.trim(),
        updatedAt: new Date(),
        version: (post.version || 0) + 1,
      },
    };

    await collection.updateOne({ _id: new ObjectId(id as string) }, update);

    const updatedPost = await collection.findOne({
      _id: new ObjectId(id as string),
    });

    return NextResponse.json({
      post: {
        ...updatedPost,
        id: updatedPost?._id.toString(),
        authorId: updatedPost?.authorId.toString(),
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
  { params }: { params: Promise<{ id: string | string[] | undefined }> }
) {
  try {
    const id = (await params).id;
    const userId = request.headers.get("x-user-id");
    const userRole = request.headers.get("x-user-role");

    const collection = await getPostsCollection();
    const post = await collection.findOne({ _id: new ObjectId(id as string) });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (userRole !== "admin" && post.authorId.toString() !== userId) {
      return NextResponse.json(
        { error: "Unauthorized to delete this post" },
        { status: 403 }
      );
    }

    await collection.deleteOne({ _id: new ObjectId(id as string) });

    const commentsCollection = await getCommentsCollection();
    await commentsCollection.deleteMany({ postId: new ObjectId(id as string) });

    return NextResponse.json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.error("Failed to delete post:", error);
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 }
    );
  }
}
