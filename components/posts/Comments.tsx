"use client";

import { usePost } from "@/hooks/usePost";
import type { Comment } from "@/lib/db/schemas";
import { useAuthContext } from "@/providers/AuthProvider";
import { useTinybase } from "@/providers/TinybaseProvider";
import { useState } from "react";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import DeleteButton from "../common/DeleteButton";
import { formatRelativeTime } from "@/lib/utils";

interface CommentsProps {
  postId: string;
  existingComments?: Comment[];
}

export function Comments({ postId, existingComments = [] }: CommentsProps) {
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const { user } = useAuthContext();
  const { isOnline } = useTinybase();

  const {
    data,
    isLoading,
    createCommentMutation,
    createCommentOffline,
    deleteCommentMutation,
    deleteCommentOffline,
  } = usePost(postId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!content.trim()) {
      setError("Comment cannot be empty");
      return;
    }

    if (!isOnline) {
      createCommentOffline(content);
      setContent("");
      return;
    }

    try {
      await createCommentMutation.mutateAsync(content);
      setContent("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post comment");
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!window.confirm("Are you sure you want to delete this comment?"))
      return;

    if (!isOnline) {
      deleteCommentOffline(commentId);
      return;
    }

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
      <h2 className="text-xl font-bold"> {existingComments.length} Comments</h2>
      <form onSubmit={handleSubmit} className="space-y-2">
        <div>
          <Textarea
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              setError("");
            }}
            placeholder="Add a comment..."
            rows={3}
            className="w-full rounded-lg border-gray-300 text-black shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {error && <div className="text-red-500 text-sm">{error}</div>}

        {!isOnline && (
          <div className="text-yellow-600 text-sm">
            You're offline. Comments will be synchronized when you're back
            online.
          </div>
        )}

        <Button
          type="submit"
          disabled={createCommentMutation.isPending}
          className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400"
        >
          {createCommentMutation.isPending ? "Posting..." : "Post Comment"}
        </Button>
      </form>
      <div className="space-y-4">
        {existingComments.map((comment) => (
          <div key={comment.id} className="bg-white p-4 rounded-md border">
            <div className="flex justify-between items-start">
              <p className="text-gray-700">{comment.content}</p>
              {canDeleteComment(comment) && (
                <DeleteButton handleClick={() => handleDelete(comment.id)} />
              )}
            </div>
            <div className="mt-2 text-sm text-gray-500">
              {formatRelativeTime(new Date(comment.createdAt))}
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
