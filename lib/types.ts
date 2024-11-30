import { Store } from 'tinybase';

export interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  content: string;
  authorId: string;
  createdAt: string;
}

export interface PendingChange {
  type: 'create' | 'update' | 'delete';
  table: 'posts' | 'comments';
  id: string;
  data?: any;
  timestamp: number;
}

// TinyBase tables structure
export interface TableData {
  posts: Record<string, Post>;
  comments: Record<string, Comment>;
  pendingChanges: Record<string, PendingChange>;
}

// TinyBase store values
export interface StoreValues {
  lastSync: number;
  isOnline: boolean;
}

export type BlogStore = Store;

export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  username: string;
  role: UserRole;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export interface PostsResponse extends ApiResponse<Post[]> {}
export interface PostResponse extends ApiResponse<Post> {}
export interface CommentsResponse extends ApiResponse<Comment[]> {}
export interface CommentResponse extends ApiResponse<Comment> {}