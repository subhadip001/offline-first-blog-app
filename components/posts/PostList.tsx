"use client";

import { usePosts } from "@/hooks/usePosts";
import { Post } from "@/lib/db/schemas";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function PostList() {
  const {
    posts: data,
    isLoading,
    deletePostMutation,
    canDeletePost,
  } = usePosts();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse bg-white rounded-lg shadow p-6">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!data?.posts?.length) {
    return <div className="text-center text-gray-500">No posts yet</div>;
  }

  const handleDelete = async (e: React.MouseEvent, postId: string) => {
    e.preventDefault(); // Prevent navigation when clicking delete
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await deletePostMutation.mutateAsync(postId);
      } catch (error) {
        console.error("Failed to delete post:", error);
        alert("Failed to delete post");
      }
    }
  };

  return (
    <div className="space-y-6">
      {data.posts.map((post: Post) => (
        <Link
          href={`/posts/${post.id}`}
          key={post.id}
          className="block bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
        >
          <article>
            <div className="flex justify-between items-start">
              <h2 className="text-xl font-bold text-gray-900">{post.title}</h2>
              {canDeletePost(post) && (
                <button
                  onClick={(e) => handleDelete(e, post.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
              )}
            </div>
            <p className="mt-2 text-gray-600 line-clamp-3">{post.content}</p>
            <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
              <span>
                Posted on: {new Date(post.createdAt).toLocaleDateString()}
              </span>
              <span className="text-indigo-600">Read more →</span>
            </div>
          </article>
        </Link>
      ))}
    </div>
  );
}
