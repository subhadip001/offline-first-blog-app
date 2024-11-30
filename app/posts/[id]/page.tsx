"use client";

import { useQuery } from "@tanstack/react-query";
import { usePosts } from "@/hooks/usePosts";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/providers/AuthProvider";

async function fetchPost(postId: string) {
  const res = await fetch(`/api/posts/${postId}`);
  if (!res.ok) {
    throw new Error("Failed to fetch post");
  }
  return res.json();
}

export default function PostPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { isAuthenticated } = useAuthContext();
  const { deletePost, canDeletePost } = usePosts();

  const { data, isLoading } = useQuery({
    queryKey: ["post", params.id],
    queryFn: () => fetchPost(params.id),
  });

  // Redirect if not authenticated
  if (!isAuthenticated()) {
    router.push("/login");
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-3xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!data?.post) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-red-500">Failed to load post</div>
          <button
            onClick={() => router.push("/")}
            className="mt-4 text-indigo-600 hover:text-indigo-800"
          >
            Go back to posts
          </button>
        </div>
      </div>
    );
  }

  const post = data.post;

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      await deletePost.mutateAsync(post.id);
      router.push("/");
    } catch (error) {
      console.error("Failed to delete post:", error);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-3xl font-bold text-gray-900">{post.title}</h1>
            {canDeletePost(post) && (
              <button
                onClick={handleDelete}
                className="text-red-600 hover:text-red-800 font-medium"
              >
                Delete Post
              </button>
            )}
          </div>

          <div className="prose max-w-none">
            <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
          </div>

          <div className="mt-6 text-sm text-gray-500">
            Posted on: {new Date(post.createdAt).toLocaleDateString()}
          </div>
        </div>

        <button
          onClick={() => router.push("/")}
          className="mt-6 text-indigo-600 hover:text-indigo-800"
        >
          ← Back to posts
        </button>
      </div>
    </div>
  );
}
