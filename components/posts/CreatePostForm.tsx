"use client";

import { useState } from "react";
import { usePosts } from "@/hooks/usePosts";

export function CreatePostForm() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const { createPostMutation, isOnline } = usePosts();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await createPostMutation.mutateAsync({ title, content });
      // Clear form after successful creation
      setTitle("");
      setContent("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create post");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 mb-8 p-4 bg-white rounded-lg shadow"
    >
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700"
        >
          Title
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full text-black rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
        />
      </div>

      <div>
        <label
          htmlFor="content"
          className="block text-sm font-medium text-gray-700"
        >
          Content
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          className="mt-1 block w-full text-black rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
        />
      </div>

      {error && <div className="text-red-500 text-sm">{error}</div>}

      {!isOnline && (
        <div className="text-yellow-600 text-sm">
          You're offline. The post will be synchronized when you're back online.
        </div>
      )}

      <button
        type="submit"
        disabled={createPostMutation.isPending}
        className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-400"
      >
        {createPostMutation.isPending ? "Creating..." : "Create Post"}
      </button>
    </form>
  );
}
