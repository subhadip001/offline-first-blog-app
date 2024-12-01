"use client";

import { usePosts } from "@/hooks/usePosts";
import { Post } from "@/lib/db/schemas";
import { formatRelativeTime } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useState } from "react";
import DeleteButton from "../common/DeleteButton";
import { Pagination } from "../common/Pagination";
import { Card } from "../ui/card";
import UserName from "../common/UserName";

export function PostList() {
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 3;

  const {
    posts: data,
    isLoading,
    deletePostMutation,
    deletePostOffline,
    isOnline,
    canDeletePost,
  } = usePosts({ page: currentPage, limit: postsPerPage });
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

  const totalPages = Math.ceil((data?.total || 0) / postsPerPage);

  const handleDelete = async (e: React.MouseEvent, postId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this post?")) {
      if (!isOnline) {
        deletePostOffline(postId);
      }
      try {
        await deletePostMutation.mutateAsync(postId);
      } catch (error) {
        console.error("Failed to delete post:", error);
        alert("Failed to delete post");
      }
    }
  };

  return (
    <div>
      <div className="space-y-6">
        {data.posts.map((post: Post) => (
          <Card
            onClick={() => router.push(`/posts/${post.id}`)}
            key={post.id}
            className="p-4 cursor-pointer"
          >
            <article>
              <div className="mb-4">
                <div className="text-gray-500 flex items-center gap-2">
                  <UserName userId={post.authorId} />
                  <span className=" text-xs">
                    {formatRelativeTime(new Date(post.createdAt))}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-start">
                <h2 className="text-xl font-bold text-gray-900">
                  {post.title}
                </h2>
                {canDeletePost(post) && (
                  <DeleteButton handleClick={(e) => handleDelete(e, post.id)} />
                )}
              </div>
              <p className="mt-2 text-gray-600 line-clamp-1">{post.content}</p>
              <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
                <span className="text-blue-600">Read more</span>
              </div>
            </article>
          </Card>
        ))}
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
