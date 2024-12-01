"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTinybase } from "@/providers/TinybaseProvider";
import { useAuthContext } from "@/providers/AuthProvider";
import { fetchPosts, QueryKeys } from "@/lib/queries";
import { CreatePostData, Post } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";
import { useEffect, useState } from "react";
import { Row } from "tinybase";

export function usePosts() {
  const { store, isOnline } = useTinybase();
  const { user } = useAuthContext();
  const queryClient = useQueryClient();

  const { data: onlinePosts, isLoading: isOnlineLoading } = useQuery({
    queryKey: [QueryKeys.POSTS],
    queryFn: fetchPosts,
    enabled: isOnline,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (store && onlinePosts?.posts && isOnline) {
      const pendingChanges = store.getTable("pendingChanges");
      const pendingDeletes = Object.values(pendingChanges)
        .filter((change) => change.type === "delete")
        .map((change) => change.id);

      onlinePosts?.posts?.forEach((post: Post) => {
        if (!pendingDeletes.includes(post.id)) {
          store.setRow("posts", post.id, post as unknown as Row);
        }
      });
    }
  }, [store, onlinePosts, isOnline]);

  const getOfflinePosts = () => {
    if (!store) return [];
    const postsTable = store.getTable("posts");
    return Object.entries(postsTable)
      .map(([id, post]) => ({
        id,
        ...post,
      }))
      .sort(
        (a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  };

  const [offlinePosts, setOfflinePosts] = useState(getOfflinePosts());

  useEffect(() => {
    if (!store) return;

    const listenerId = store.addTableListener("posts", () => {
      setOfflinePosts(getOfflinePosts());
    });

    return () => {
      store.delListener(listenerId);
    };
  }, [store]);

  const posts = isOnline ? onlinePosts : { posts: offlinePosts };

  const createPost = async (postData: CreatePostData) => {
    const newPost = {
      ...postData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      authorId: user?.id as string,
    };

    if (isOnline) {
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
        throw new Error("Failed to create post");
      }

      const createdPost = await res.json();
      store?.setRow("posts", createdPost.id, createdPost);
      return createdPost;
    } else {
    }
  };

  const createPostOffline = async (postData: CreatePostData) => {
    const newPost = {
      ...postData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      authorId: user?.id as string,
    };
    store?.setRow("posts", newPost.id, newPost);

    store?.setRow("pendingChanges", uuidv4(), {
      type: "create",
      table: "posts",
      data: JSON.stringify(newPost),
      id: newPost.id,
      timestamp: Date.now(),
    });

    return newPost;
  };

  const deletePost = async (postId: string) => {
    if (isOnline) {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to delete post");
      }

      store?.delRow("posts", postId);
      return res.json();
    } else {
    }
  };

  const deletePostOffline = async (postId: string) => {
    store?.delRow("posts", postId);

    store?.setRow("pendingChanges", uuidv4(), {
      type: "delete",
      table: "posts",
      id: postId,
      timestamp: Date.now(),
    });
  };
  const createPostMutation = useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.POSTS] });
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: deletePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.POSTS] });
    },
  });

  const canDeletePost = (post: Post) => {
    return user?.role === "admin" || post.authorId === user?.id;
  };

  return {
    posts,
    isLoading: isOnlineLoading,
    createPostMutation,
    createPostOffline,
    deletePostMutation,
    deletePostOffline,
    canDeletePost,
    isOnline,
  };
}
