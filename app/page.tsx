"use client";

import Header from "@/components/common/Header";
import { CreatePostForm } from "@/components/posts/CreatePostForm";
import Greetings from "@/components/posts/Greetings";
import { PostList } from "@/components/posts/PostList";
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
      <Header />
      <section>
        <div className="flex flex-col gap-4">
          <Greetings />
          <CreatePostForm />
        </div>
        <PostList />
      </section>
    </div>
  );
}
