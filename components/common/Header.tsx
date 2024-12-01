"use client";

import { useAuthContext } from "@/providers/AuthProvider";
import { useTinybase } from "@/providers/TinybaseProvider";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SyncIndicator } from "@/components/ui/SyncIndicator";

export default function Header() {
  const { user, isAuthenticated, logout, loading } = useAuthContext();
  const { isOnline } = useTinybase();
  const router = useRouter();
  return (
    <div className="flex justify-between items-center mb-8">
      <h1
        onClick={() => router.push("/")}
        className="text-2xl font-bold text-blue-600 cursor-pointer"
      >
        Offline Blog
      </h1>
      <div className="flex items-center gap-4">
        <SyncIndicator />
        {user && (
          <div className="flex items-center gap-4">
            <Button onClick={logout} variant={"outline"} className="p-3 ">
              <div>
                <LogOut className="w-4 h-4" />
              </div>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
