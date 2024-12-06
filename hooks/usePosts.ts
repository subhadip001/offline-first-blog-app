"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTinybase } from "@/providers/TinybaseProvider";
import { useAuthContext } from "@/providers/AuthProvider";
import { fetchPosts, QueryKeys } from "@/lib/queries";
import { CreatePostData, Post, UpdatePostData } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";
import { Row } from "tinybase";
import { handleApiResponse } from "@/lib/api-utils";
import { useEffect, useState } from "react";

interface UsePostsOptions {
  page?: number;
  limit?: number;
}

export function usePosts(options: UsePostsOptions = {}) {
  const { page = 1, limit = 3 } = options;
  const { store, isOnline } = useTinybase();
  const { user } = useAuthContext();
  const queryClient = useQueryClient();

  const { data: onlinePosts, isLoading: isOnlineLoading } = useQuery({
    queryKey: [QueryKeys.POSTS, page, limit],
    queryFn: () => fetchPosts({ page, limit }),
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
    if (!store) return { posts: [], total: 0 };
    const postsTable = store.getTable("posts");
    const allPosts = Object.entries(postsTable)
      .map(([id, post]) => ({
        id,
        ...post,
      }))
      .sort(
        (a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    return {
      posts: allPosts.slice(startIndex, endIndex),
      total: allPosts.length,
    };
  };

  const [offlinePosts, setOfflinePosts] = useState(getOfflinePosts());

  useEffect(() => {
    if (!store) return;

    const updateOfflinePosts = () => {
      setOfflinePosts(getOfflinePosts());
    };

    // Update when store changes
    const listenerId = store.addTableListener("posts", updateOfflinePosts);
    // Update when page or limit changes
    updateOfflinePosts();

    return () => {
      store.delListener(listenerId);
    };
  }, [store, page, limit]);

  const posts = isOnline ? onlinePosts : offlinePosts;

  const createPost = async (postData: CreatePostData) => {
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

      const createdPost = await handleApiResponse(res);
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

      await handleApiResponse(res);
      // Delete post and its comments from local store
      store?.delRow("posts", postId);
      const commentsTable = store?.getTable("comments");
      if (commentsTable) {
        Object.entries(commentsTable).forEach(([commentId, comment]) => {
          if (comment.postId === postId) {
            store?.delRow("comments", commentId);
          }
        });
      }

      return res.json();
    } else {
      throw new Error("Cannot delete post while offline");
    }
  };

  const deletePostOffline = async (postId: string) => {
    // Delete the post
    store?.delRow("posts", postId);

    // Delete all comments for this post
    const commentsTable = store?.getTable("comments");
    if (commentsTable) {
      Object.entries(commentsTable).forEach(([commentId, comment]) => {
        if (comment.postId === postId) {
          store?.delRow("comments", commentId);
        }
      });
    }

    // Add pending change for post deletion
    store?.setRow("pendingChanges", uuidv4(), {
      type: "delete",
      table: "posts",
      id: postId,
      timestamp: Date.now(),
    });
  };

  const updatePost = async (postData: UpdatePostData) => {
    if (isOnline) {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/posts/${postData.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(postData),
      });

      const updatedPost = await handleApiResponse(res);
      store?.setRow("posts", updatedPost.id, updatedPost);
      return updatedPost;
    } else {
    }
  };

  const updatePostOffline = async (postData: UpdatePostData) => {
    if (!store) return;

    const existingPost = store.getRow("posts", postData.id);

    if (!existingPost) return;

    const updatedPost = {
      ...existingPost,
      ...postData,
      updatedAt: new Date().toISOString(),
    };

    store.setRow("posts", postData.id, updatedPost);

    store.setRow("pendingChanges", postData.id, {
      type: "update",
      table: "posts",
      data: JSON.stringify(postData),
      id: postData.id,
      timestamp: Date.now(),
    });

    return updatedPost;
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

  const updatePostMutation = useMutation({
    mutationFn: updatePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.POST] });
    },
    onError: (error) => {
      console.error(error.message);
    },
  });

  const canDeletePost = (post: Post) => {
    return user?.role === "admin" || post.authorId === user?.id;
  };

  const canEditPost = (post: Post) => {
    return user?.role === "admin" || post.authorId === user?.id;
  };

  return {
    posts,
    isLoading: isOnlineLoading,
    createPostMutation,
    createPostOffline,
    deletePostMutation,
    deletePostOffline,
    updatePostMutation,
    updatePostOffline,
    canDeletePost,
    canEditPost,
    isOnline,
  };
}
