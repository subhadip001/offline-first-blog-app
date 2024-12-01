import { Store } from "tinybase";

export type CreatePostData = {
  title: string;
  content: string;
};

export type Post = {
  id: string;
  title: string;
  content: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
};

export type Comment = {
  id: string;
  postId: string;
  content: string;
  authorId: string;
  createdAt: string;
};

export type PendingChange = {
  type: "create" | "update" | "delete";
  table: "posts" | "comments";
  id: string;
  data?: any;
  timestamp: number;
};

// TinyBase tables structure
export type TableData = {
  posts: Record<string, Post>;
  comments: Record<string, Comment>;
  pendingChanges: Record<string, PendingChange>;
};

// TinyBase store values
export type StoreValues = {
  lastSync: number;
  isOnline: boolean;
};

export type BlogStore = Store;

export type UserRole = "admin" | "user";

export type User = {
  id: string;
  username: string;
  role: UserRole;
};

export type AuthResponse = {
  token: string;
  user: User;
};

// API Response types
export type ApiResponse<T> = {
  data?: T;
  error?: string;
};

export interface PostsResponse extends ApiResponse<Post[]> {}
export interface PostResponse extends ApiResponse<Post> {}
export interface CommentsResponse extends ApiResponse<Comment[]> {}
export interface CommentResponse extends ApiResponse<Comment> {}
