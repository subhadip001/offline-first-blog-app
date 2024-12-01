"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthContext } from "@/providers/AuthProvider";
import { useTinybase } from "@/providers/TinybaseProvider";
import type { Comment } from "@/lib/db/schemas";
import { usePost } from "@/hooks/usePost";

interface CommentsProps {
  postId: string;
  existingComments?: Comment[];
}

export function Comments({ postId, existingComments = [] }: CommentsProps) {
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const { user } = useAuthContext();
  const { isOnline } = useTinybase();
  const queryClient = useQueryClient();

  const { data, isLoading, createCommentMutation, deleteCommentMutation } =
    usePost(postId);

  // const createComment = useMutation({
  //   mutationFn: async (content: string) => {
  //     const token = localStorage.getItem("token");
  //     const res = await fetch(`/api/posts/${postId}/comments`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${token}`,
  //       },
  //       body: JSON.stringify({ content }),
  //     });

  //     if (!res.ok) {
  //       const error = await res.json();
  //       throw new Error(error.message || "Failed to create comment");
  //     }

  //     return res.json();
  //   },
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ["post", postId] });
  //     setContent("");
  //   },
  // });

  // const deleteComment = useMutation({
  //   mutationFn: async (commentId: string) => {
  //     const token = localStorage.getItem("token");
  //     const res = await fetch(
  //       `/api/posts/${postId}/comments?commentId=${commentId}`,
  //       {
  //         method: "DELETE",
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       }
  //     );

  //     if (!res.ok) {
  //       const error = await res.json();
  //       throw new Error(error.message || "Failed to delete comment");
  //     }

  //     return res.json();
  //   },
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ["post", postId] });
  //   },
  // });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!content.trim()) {
      setError("Comment cannot be empty");
      return;
    }

    try {
      await createCommentMutation.mutateAsync(content);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post comment");
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!window.confirm("Are you sure you want to delete this comment?"))
      return;

    try {
      await deleteCommentMutation.mutateAsync(commentId);
    } catch (error) {
      console.error("Failed to delete comment:", error);
    }
  };

  const canDeleteComment = (comment: Comment) => {
    return user?.role === "admin" || comment.authorId === user?.id;
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Comments</h2>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Add a comment..."
            rows={3}
            className="w-full rounded-lg border-gray-300 text-black shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        {error && <div className="text-red-500 text-sm">{error}</div>}

        {!isOnline && (
          <div className="text-yellow-600 text-sm">
            You're offline. Comments will be synchronized when you're back
            online.
          </div>
        )}

        <button
          type="submit"
          disabled={createCommentMutation.isPending}
          className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-400"
        >
          {createCommentMutation.isPending ? "Posting..." : "Post Comment"}
        </button>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {existingComments.map((comment) => (
          <div key={comment.id} className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-start">
              <p className="text-gray-700">{comment.content}</p>
              {canDeleteComment(comment) && (
                <button
                  onClick={() => handleDelete(comment.id)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Delete
                </button>
              )}
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Posted on: {new Date(comment.createdAt).toLocaleDateString()}
            </div>
          </div>
        ))}

        {existingComments.length === 0 && (
          <div className="text-center text-gray-500">
            No comments yet. Be the first to comment!
          </div>
        )}
      </div>
    </div>
  );
}
