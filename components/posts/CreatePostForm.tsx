"use client";

import { usePosts } from "@/hooks/usePosts";
import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";

export function CreatePostForm() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const { createPostMutation, isOnline, createPostOffline } = usePosts();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isOnline) {
      createPostOffline({ title, content });
      setTitle("");
      setContent("");
      return;
    }

    try {
      await createPostMutation.mutateAsync({ title, content });
      setTitle("");
      setContent("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create post");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 mb-8 p-4 bg-white rounded-md border"
    >
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700"
        >
          Title
        </label>
        <Input
          type="text"
          id="title"
          value={title}
          placeholder="Enter post title"
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full text-black rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
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
        <Textarea
          id="content"
          value={content}
          placeholder="Enter post content"
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          className="mt-1 block w-full text-black rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          required
        />
      </div>

      {error && <div className="text-red-500 text-sm">{error}</div>}

      {!isOnline && (
        <div className="text-yellow-600 text-sm">
          You're offline. The post will be synchronized when you're back online.
        </div>
      )}

      <Button
        type="submit"
        disabled={createPostMutation.isPending}
        className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400"
      >
        {createPostMutation.isPending ? "Creating..." : "Create Post"}
      </Button>
    </form>
  );
}
