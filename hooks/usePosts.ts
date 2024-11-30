"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTinybase } from "@/providers/TinybaseProvider";
import { useAuthContext } from "@/providers/AuthProvider";
import type { Post } from "@/lib/db/schemas";
import { fetchPosts, QueryKeys } from "@/lib/queries";

type CreatePostData = {
  title: string;
  content: string;
};

export function usePosts() {
  const { store, isOnline } = useTinybase();
  const { user } = useAuthContext();
  const queryClient = useQueryClient();

  const { data: posts, isLoading } = useQuery({
    queryKey: [QueryKeys.POSTS],
    queryFn: fetchPosts,
    enabled: isOnline, // Only fetch when online
  });

  const createPost = useMutation({
    mutationFn: async (postData: CreatePostData) => {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(postData),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create post");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.POSTS] });
    },
  });

  const deletePost = useMutation({
    mutationFn: async (postId: string) => {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to delete post");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const canDeletePost = (post: Post) => {
    return user?.role === "admin" || post.authorId === user?.id;
  };

  return {
    posts,
    isLoading,
    createPost,
    deletePost,
    canDeletePost,
    isOnline,
  };
}
