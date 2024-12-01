import React from "react";
import { useTinybase } from "@/providers/TinybaseProvider";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";

export function SyncIndicator() {
  const { isOnline, lastSync } = useTinybase();

  return (
    <div className=" bg-white rounded-md flex items-center space-x-3">
      <div className="flex items-center">
        {isOnline ? (
          <Wifi className="w-5 h-5 text-green-500" />
        ) : (
          <WifiOff className="w-5 h-5 text-red-500" />
        )}
      </div>

      <div className="text-sm">
        <div className={isOnline ? "text-green-600" : "text-red-600"}>
          {isOnline ? "Online" : "Offline"}
        </div>
        <div className="text-gray-500 text-xs">
          Last sync: {formatRelativeTime(lastSync as Date)}
        </div>
      </div>
    </div>
  );
}
