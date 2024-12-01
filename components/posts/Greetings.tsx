"use client";

import { useAuthContext } from "@/providers/AuthProvider";
import { useTinybase } from "@/providers/TinybaseProvider";
import { Star, UserRound } from "lucide-react";

export default function Greetings() {
  const { user, isAuthenticated, logout, loading } = useAuthContext();
  const { isOnline } = useTinybase();
  return (
    <div>
      {user && (
        <div className="flex items-center gap-4">
          <div className="text-sm flex gap-2">
            Welcome,
            <div className="flex items-center gap-2">
              <span className="font-bold capitalize">{user.username}</span>
              <div>
                {user.role === "admin" ? (
                  <div className="text-xs text-gray-500">
                    <Star className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="text-xs text-gray-500">
                    <UserRound className="w-4 h-4" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
