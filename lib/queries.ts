import { CreatePostData } from "./types";

export enum QueryKeys {
  POSTS = "posts",
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

export const fetchPosts = () => {
  return fechData("/api/posts");
};

export const fetchPostById = async (postId: string) => {
  const response = await fechData(`/api/posts/${postId}`);
  return response;
};

export const createPost = (data: CreatePostData) => {
  const res = postData("/api/posts", data);
  return res;
};
