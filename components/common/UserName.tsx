"use client";

import { getUserById } from "@/lib/queries";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

interface UserNameProps {
  userId: string;
  className?: string;
}

export default function UserName({ userId, className = "" }: UserNameProps) {
  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["userName", userId],
    queryFn: () => getUserById(userId),
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return <span className={`text-gray-400 ${className}`}>Loading...</span>;
  }

  if (error) {
    return <span className={`text-gray-400 ${className}`}>Unknown User</span>;
  }

  return (
    <span className={cn("font-semibold capitalize", className)}>
      {user?.username}
    </span>
  );
}
