import { ObjectId, Document } from 'mongodb';

export interface DBUser extends Document {
  _id: ObjectId;
  username: string;
  password: string;
  role: 'admin' | 'user';
  createdAt: Date;
  updatedAt: Date;
}

export interface DBPost extends Document {
  _id: ObjectId;
  title: string;
  content: string;
  authorId: ObjectId;
  createdAt: Date;
  updatedAt: Date;
  version: number; // For LWW conflict resolution
}

export interface DBComment extends Document {
  _id: ObjectId;
  postId: ObjectId;
  content: string;
  authorId: ObjectId;
  createdAt: Date;
  updatedAt: Date;
  version: number; // For LWW conflict resolution
}

export const Collections = {
  USERS: 'users',
  POSTS: 'posts',
  COMMENTS: 'comments',
} as const;

// API response types
export interface ApiSuccess<T> {
  data: T;
  error?: never;
}

export interface ApiError {
  data?: never;
  error: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// Frontend types (without internal MongoDB fields)
export interface User {
  id: string;
  username: string;
  role: 'admin' | 'user';
}

export interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface Comment {
  id: string;
  postId: string;
  content: string;
  authorId: string;
  createdAt: string;
  version: number;
}