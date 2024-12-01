"use client";

import { useAuthContext } from "@/providers/AuthProvider";
import { useTinybase } from "@/providers/TinybaseProvider";

export default function Greetings() {
  const { user, isAuthenticated, logout, loading } = useAuthContext();
  const { isOnline } = useTinybase();
  return (
    <div>
      {user && (
        <div className="flex items-center gap-4">
          <span className="text-sm">
            Welcome,{" "}
            <span className="font-bold capitalize">{user.username}</span>
          </span>
        </div>
      )}
    </div>
  );
}
