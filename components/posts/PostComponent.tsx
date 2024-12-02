"use client";

import { usePost } from "@/hooks/usePost";
import { usePosts } from "@/hooks/usePosts";
import { formatRelativeTime } from "@/lib/utils";
import { useAuthContext } from "@/providers/AuthProvider";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import DeleteButton from "../common/DeleteButton";
import Header from "../common/Header";
import { Comments } from "./Comments";
import UserName from "../common/UserName";
import { UpdatePostDialog } from "./UpdatePostDialog";

export default function PostComponent() {
  const router = useRouter();
  const { id } = useParams();
  const { isAuthenticated, user, loading } = useAuthContext();
  const {
    deletePostMutation,
    deletePostOffline,
    canDeletePost,
    canEditPost,
    isOnline,
  } = usePosts();

  const { data, isLoading } = usePost(id as string);

  useEffect(() => {
    if (!loading && !isAuthenticated()) {
      router.push("/login");
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="min-h-screen p-8">
        <div className="">
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

  if (isLoading) {
    return (
      <div className="min-h-screen p-8">
        <div className="">
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

  if (!data || !data.post) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-red-500">Failed to load post</div>
          <button
            onClick={() => router.push("/")}
            className="mt-4 text-blue-600 hover:text-blue-800"
          >
            Go back to posts
          </button>
        </div>
      </div>
    );
  }

  const { post, comments } = data;

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    if (!isOnline) {
      deletePostOffline(post.id);
      router.push("/");
      router.back();
      return;
    }

    try {
      await deletePostMutation.mutateAsync(post.id);
      router.push("/");
    } catch (error) {
      console.error("Failed to delete post:", error);
    }
  };

  return (
    <div className="min-h-screen p-8 ">
      <Header />
      <div className="">
        <div className="bg-white rounded-md border p-6">
          <div className="text-gray-500 flex items-center gap-2">
            <UserName userId={post.authorId} />
            <span className=" text-xs">
              {formatRelativeTime(new Date(post.createdAt))}
            </span>
          </div>
          <div className="flex justify-between items-start my-4">
            <h1 className="text-3xl font-bold text-gray-900">{post?.title}</h1>
            <div className="flex items-center space-x-2">
              {canEditPost(post) && <UpdatePostDialog post={post} />}
              {canDeletePost(post) && (
                <DeleteButton handleClick={handleDelete} />
              )}
            </div>
          </div>

          <div className="prose max-w-none">
            <p className="text-gray-700 whitespace-pre-wrap">{post?.content}</p>
          </div>
        </div>

        <div className="mt-8">
          <Comments postId={id as string} existingComments={comments} />
        </div>
      </div>
    </div>
  );
}
