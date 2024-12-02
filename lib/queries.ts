import { CreatePostData } from "./types";

export enum QueryKeys {
  POSTS = "posts",
  POST = "post",
}

const getAccessToken = () => {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("token");
  return token;
};

const fechData = async (url: string) => {
  const token = getAccessToken();
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Failed to fetch data");
  }
  return res.json();
};

const postData = async (url: string, data: any) => {
  const token = getAccessToken();
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to fetch data");
  return res.json();
};

const patchData = async (url: string, data: any) => {
  const token = getAccessToken();
  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to fetch data");
  return res.json();
};

interface FetchPostsOptions {
  page?: number;
  limit?: number;
}

export const fetchPosts = ({ page = 1, limit = 3 }: FetchPostsOptions = {}) => {
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  return fechData(`/api/posts?${queryParams}`);
};

export const fetchPostById = async (postId: string) => {
  const response = await fechData(`/api/posts/${postId}`);
  return response;
};

export const createPost = (data: CreatePostData) => {
  const res = postData("/api/posts", data);
  return res;
};

export const getUserById = async (userId: string) => {
  const response = await fechData(`/api/users?userId=${userId}`);
  return response;
};

