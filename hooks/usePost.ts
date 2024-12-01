"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTinybase } from "@/providers/TinybaseProvider";
import { QueryKeys, fetchPostById } from "@/lib/queries";
import { Comment, Post } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";
import { Row } from "tinybase";
import { useAuthContext } from "@/providers/AuthProvider";
import { useEffect, useState } from "react";

export function usePost(postId: string) {
  const { store, isOnline } = useTinybase();
  const queryClient = useQueryClient();
  const { user } = useAuthContext();

  const { data: onlineData, isLoading } = useQuery({
    queryKey: [QueryKeys.POST, postId],
    queryFn: () => fetchPostById(postId),
    enabled: isOnline,
    refetchOnWindowFocus: false,
  });

  console.log(onlineData);

  // Sync online data with local store
  useEffect(() => {
    if (store && onlineData && isOnline) {
      const pendingChanges = store.getTable("pendingChanges");
      const pendingDeletes = Object.values(pendingChanges)
        .filter((change) => change.type === "delete")
        .map((change) => change.id);

      // Sync post
      if (onlineData.post && !pendingDeletes.includes(onlineData.post.id)) {
        store.setRow(
          "posts",
          onlineData.post.id,
          onlineData.post as unknown as Row
        );
      }

      // Sync comments
      onlineData.comments?.forEach((comment: Comment) => {
        if (!pendingDeletes.includes(comment.id)) {
          store.setRow("comments", comment.id, comment as unknown as Row);
        }
      });
    }
  }, [store, onlineData, isOnline]);

  const getOfflinePost = () => {
    if (!store) return null;
    const postsTable = store.getTable("posts");
    const post = postsTable[postId];
    return post ? { id: postId, ...post } : null;
  };

  const getOfflineComments = () => {
    if (!store) return [];
    const commentsTable = store.getTable("comments");

    return Object.entries(commentsTable)
      .filter(([id, comment]) => comment.postId === postId)
      .map(([id, comment]) => ({ id, ...comment }));
  };

  const [offlineComments, setOfflineComments] = useState(getOfflineComments());

  useEffect(() => {
    setOfflineComments(getOfflineComments());
  }, [store, postId]);

  // Listen for local comment changes
  useEffect(() => {
    if (!store) return;

    const commentsListenerId = store.addTableListener("comments", () => {
      setOfflineComments(getOfflineComments());
    });

    const changesListenerId = store.addTableListener("pendingChanges", () => {
      setOfflineComments(getOfflineComments());
    });

    return () => {
      store.delListener(commentsListenerId);
      store.delListener(changesListenerId);
    };
  }, [store, postId]);

  const post = isOnline
    ? onlineData
    : { post: getOfflinePost(), comments: offlineComments };

  const createComment = async (content: string) => {
    if (isOnline) {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create comment");
      }

      return res.json();
    } else {
    }
  };

  const createCommentOffline = async (content: string) => {
    const newComment: Comment = {
      id: uuidv4(),
      content,
      postId,
      createdAt: new Date().toISOString(),
      authorId: user?.id as string,
    };
    store?.setRow("comments", newComment.id, newComment as unknown as Row);

    store?.setRow("pendingChanges", uuidv4(), {
      type: "create",
      table: "comments",
      data: newComment.content,
      id: newComment.id,
      postId,
      timestamp: Date.now(),
    });
    return newComment;
  };

  const deleteComment = async (commentId: string) => {
    if (isOnline) {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `/api/posts/${postId}/comments?commentId=${commentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to delete comment");
      }
    } else {
    }
  };

  const deleteCommentOffline = async (commentId: string) => {
    store?.delRow("comments", commentId);
    store?.setRow("pendingChanges", uuidv4(), {
      type: "delete",
      table: "comments",
      id: commentId,
      postId,
      timestamp: Date.now(),
    });
  };

  const createCommentMutation = useMutation({
    mutationFn: createComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.POST, postId] });
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: deleteComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.POST, postId] });
    },
  });

  return {
    data: {
      post: post?.post,
      comments: post?.comments || [],
    },
    isLoading,
    isOnline,
    createCommentMutation,
    createCommentOffline,
    deleteCommentMutation,
    deleteCommentOffline,
  };
}
