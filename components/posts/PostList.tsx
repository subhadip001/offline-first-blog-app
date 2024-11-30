"use client";

import { usePosts } from "@/hooks/usePosts";
import { Post } from "@/lib/db/schemas";

export function PostList() {
  const { posts, isLoading, deletePost, canDeletePost } = usePosts();

  if (isLoading) {
    return <div className="text-center">Loading posts...</div>;
  }

  if (!posts?.length) {
    return <div className="text-center text-gray-500">No posts yet</div>;
  }

  const handleDelete = async (postId: string) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await deletePost.mutateAsync(postId);
      } catch (error) {
        console.error("Failed to delete post:", error);
      }
    }
  };

  return (
    <div className="space-y-6">
      {posts.map((post: Post) => (
        <article key={post.id} className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start">
            <h2 className="text-xl font-bold text-gray-900">{post.title}</h2>
            {canDeletePost(post) && (
              <button
                onClick={() => handleDelete(post.id)}
                className="text-red-600 hover:text-red-800"
              >
                Delete
              </button>
            )}
          </div>
          <p className="mt-2 text-gray-600">{post.content}</p>
          <div className="mt-4 text-sm text-gray-500">
            Posted on: {new Date(post.createdAt).toLocaleDateString()}
          </div>
        </article>
      ))}
    </div>
  );
}
