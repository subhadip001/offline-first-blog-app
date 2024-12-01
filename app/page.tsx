"use client";

import { CreatePostForm } from "@/components/posts/CreatePostForm";
import { PostList } from "@/components/posts/PostList";
import { SyncIndicator } from "@/components/ui/SyncIndicator";
import { useAuthContext } from "@/providers/AuthProvider";
import { useTinybase } from "@/providers/TinybaseProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { user, isAuthenticated, logout, loading } = useAuthContext();
  const { isOnline } = useTinybase();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated()) {
      router.push("/login");
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header with auth status */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Offline Blog</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm">
              Status: {isOnline ? "Online" : "Offline"}
            </span>
            {/* <SyncIndicator /> */}
            {user && (
              <div className="flex items-center gap-4">
                <span className="text-sm">Welcome, {user.username}</span>
                <button
                  onClick={logout}
                  className="px-4 py-2 text-sm text-white bg-red-500 rounded hover:bg-red-600"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Main content will go here */}
        <section>
          <CreatePostForm />
          <PostList />
        </section>
      </div>
    </div>
  );
}
