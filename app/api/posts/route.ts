import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getPostsCollection } from '@/lib/db/mongodb';
import { DBPost } from '@/lib/db/schemas';

export async function GET(request: NextRequest) {
  try {
    const collection = await getPostsCollection();
    const posts = await collection.find({}).toArray();

    return NextResponse.json({
      posts: posts.map(post => ({
        ...post,
        id: post._id.toString(),
        _id: undefined
      }))
    });
  } catch (error) {
    console.error('Failed to fetch posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const json = await request.json();
    const { title, content } = json;

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    const collection = await getPostsCollection();
    
    const post: Omit<DBPost, '_id'> = {
      title,
      content,
      authorId: new ObjectId(userId),
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
    };

    const result = await collection.insertOne(post as DBPost);
    const insertedPost = await collection.findOne({ _id: result.insertedId });

    return NextResponse.json({
      post: {
        ...insertedPost,
        id: insertedPost?._id.toString(),
        _id: undefined
      }
    });
  } catch (error) {
    console.error('Failed to create post:', error);
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}