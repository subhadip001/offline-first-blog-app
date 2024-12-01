"use client";
import {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useState,
} from "react";
import { createStore } from "tinybase";
import type { BlogStore } from "@/lib/types";
import { useQueryClient } from "@tanstack/react-query";
import { QueryKeys } from "@/lib/queries";

interface TinybaseContextType {
  store: BlogStore | null;
  isOnline: boolean;
  lastSync: Date | null;
  syncError: string | null;
}

const TinybaseContext = createContext<TinybaseContextType>({
  store: null,
  isOnline: true,
  lastSync: null,
  syncError: null,
});

export function TinybaseProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<BlogStore | null>(null);
  const [isOnline, setIsOnline] = useState(
    typeof window !== "undefined" ? navigator.onLine : true
  );
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  const queryClient = useQueryClient();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const newStore = createStore();

    newStore.setTables({
      posts: {},
      comments: {},
      pendingChanges: {},
    });

    const currentTime = Date.now();

    newStore.setValues({
      lastSync: currentTime,
      isOnline: navigator.onLine,
      syncError: "",
    });

    const persistedData = localStorage.getItem("offlineBlogData");
    if (persistedData) {
      try {
        newStore.setJson(persistedData);
      } catch (error) {
        console.error("Error loading persisted data:", error);
      }
    }

    newStore.addTablesListener(() => {
      try {
        localStorage.setItem("offlineBlogData", newStore.getJson());
      } catch (error) {
        console.error("Error persisting data:", error);
      }
    });

    newStore.addValuesListener(() => {
      try {
        localStorage.setItem("offlineBlogData", newStore.getJson());
        const syncTime = newStore.getValue("lastSync");
        if (syncTime !== undefined) {
          setLastSync(new Date(syncTime as number));
        }
      } catch (error) {
        console.error("Error persisting data:", error);
      }
    });

    const handleOnline = () => {
      setIsOnline(true);
      newStore.setValue("isOnline", true);
      syncPendingChanges(newStore);
    };

    const handleOffline = () => {
      setIsOnline(false);
      newStore.setValue("isOnline", false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    setStore(newStore);
    setLastSync(new Date(currentTime));

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const syncPendingChanges = async (store: BlogStore) => {
    const pendingChanges = store.getTable("pendingChanges");
    const sortedChanges = Object.entries(pendingChanges).sort(
      ([, a], [, b]) => (a.timestamp as number) - (b.timestamp as number)
    );

    const batchSize = 5;
    for (let i = 0; i < sortedChanges.length; i += batchSize) {
      const batch = sortedChanges.slice(i, i + batchSize);

      try {
        await Promise.all(
          batch.map(async ([changeId, change]) => {
            try {
              const token = localStorage.getItem("token");
              let response;

              if (change.table === "posts") {
                switch (change.type) {
                  case "create":
                    response = await fetch(`/api/${change.table}`, {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                      },
                      body: change.data as string,
                    });

                    if (response.ok) {
                      store?.delRow("posts", change.id as string);
                    }
                    break;

                  case "update":
                    response = await fetch(
                      `/api/${change.table}/${change.id}`,
                      {
                        method: "PUT",
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify(change.data),
                      }
                    );
                    break;

                  case "delete":
                    store?.delRow("posts", change.id as string);

                    response = await fetch(
                      `/api/${change.table}/${change.id}`,
                      {
                        method: "DELETE",
                        headers: { Authorization: `Bearer ${token}` },
                      }
                    );
                    break;
                }
              } else if (change.table === "comments") {
                console.log(change);
                switch (change.type) {
                  case "create":
                    const content = change.data;
                    response = await fetch(
                      `/api/posts/${change.postId}/${change.table}`,
                      {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({ content }),
                      }
                    );
                    break;

                  case "update":
                    response = await fetch(
                      `/api/posts/${change.postId}/${change.table}?commentId=${change.id}`,
                      {
                        method: "PUT",
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify(change.data),
                      }
                    );
                    break;

                  case "delete":
                    response = await fetch(
                      `/api/posts/${change.postId}/${change.table}?commentId=${change.id}`,
                      {
                        method: "DELETE",
                        headers: { Authorization: `Bearer ${token}` },
                      }
                    );
                    break;
                }
              }

              if (!response?.ok) {
                throw new Error(`Failed to sync ${change.type} operation`);
              }

              store.delRow("pendingChanges", changeId);
              setSyncError(null);
            } catch (error) {
              console.error(`Failed to sync change ${changeId}:`, error);
              setSyncError(
                `Failed to sync some changes. Will retry when online.`
              );
            }
          })
        );

        const currentTime = Date.now();
        store.setValue("lastSync", currentTime);
        setLastSync(new Date(currentTime));
      } catch (error) {
        console.error("Batch sync failed:", error);
        setSyncError("Sync failed. Will retry when online.");
      }
    }

    queryClient.invalidateQueries({
      queryKey: [QueryKeys.POSTS],
    });
  };

  const value = {
    store,
    isOnline,
    lastSync,
    syncError,
  };

  return (
    <TinybaseContext.Provider value={value}>
      <div className="relative">{children}</div>
    </TinybaseContext.Provider>
  );
}

export const useTinybase = () => {
  const context = useContext(TinybaseContext);
  if (!context) {
    throw new Error("useTinybase must be used within a TinybaseProvider");
  }
  return context;
};
