import { createStore, Row } from "tinybase";

// Initialize store with default configuration
export function initializeStore() {
  if (typeof window === "undefined") return null;

  const store = createStore();

  // Initialize tables structure
  store.setTables({
    posts: {}, // { id: Post }
    comments: {}, // { id: Comment }
    pendingChanges: {}, // { id: PendingChange }
  });

  // Initialize store values
  store.setValues({
    lastSync: Date.now(),
    isOnline: navigator ? navigator.onLine : true,
  });

  // Set initial persisted data if available
  const persistedData = localStorage.getItem("offlineBlogData");
  if (persistedData) {
    try {
      store.setJson(persistedData);
    } catch (error) {
      console.error("Error loading persisted data:", error);
      // If loading fails, clear localStorage to prevent future errors
      localStorage.removeItem("offlineBlogData");
    }
  }

  return store;
}

// Add a pending change to the store
export function addPendingChange(
  store: ReturnType<typeof createStore>,
  type: "create" | "update" | "delete",
  table: "posts" | "comments",
  id: string,
  data?: any
) {
  const changeId = `${type}_${table}_${id}_${Date.now()}`;
  store.setRow("pendingChanges", changeId, {
    type,
    table,
    id,
    data,
    timestamp: Date.now(),
  });
}

// Get pending changes from the store
export function getPendingChanges(store: ReturnType<typeof createStore>) {
  return store.getTable("pendingChanges");
}

// Remove a pending change from the store
export function removePendingChange(
  store: ReturnType<typeof createStore>,
  changeId: string
) {
  store.delRow("pendingChanges", changeId);
}

// Batch sync function to process all pending changes
export async function batchSyncChanges(store: ReturnType<typeof createStore>) {
  const pendingChanges = getPendingChanges(store);
  const changePromises: Promise<any>[] = [];

  for (const [changeId, change] of Object.entries(pendingChanges)) {
    const promise = processSingleChange(store, changeId, change)
      .then(() => removePendingChange(store, changeId))
      .catch((error) => {
        console.error(`Failed to sync change ${changeId}:`, error);
        return error;
      });

    changePromises.push(promise);
  }

  const results = await Promise.allSettled(changePromises);
  const failedChanges = results.filter(
    (result) => result.status === "rejected"
  );

  if (failedChanges.length === 0) {
    store.setValue("lastSync", Date.now());
  }

  return {
    total: results.length,
    succeeded: results.length - failedChanges.length,
    failed: failedChanges.length,
  };
}

// Process a single change
async function processSingleChange(
  store: ReturnType<typeof createStore>,
  changeId: string,
  change: Row
) {
  const { type, table, id, data } = change;

  const baseUrl = `/api/${table}`;
  let response;

  switch (type) {
    case "create":
      response = await fetch(baseUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      break;

    case "update":
      response = await fetch(`${baseUrl}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      break;

    case "delete":
      response = await fetch(`${baseUrl}/${id}`, {
        method: "DELETE",
      });
      break;

    default:
      throw new Error(`Unknown change type: ${type}`);
  }

  if (!response.ok) {
    throw new Error(`Failed to process change: ${response.statusText}`);
  }

  return response.json();
}

// Check if there are any pending changes
export function hasPendingChanges(
  store: ReturnType<typeof createStore>
): boolean {
  const pendingChanges = getPendingChanges(store);
  return Object.keys(pendingChanges).length > 0;
}

// Get sync status
export function getSyncStatus(store: ReturnType<typeof createStore>) {
  const lastSync = store.getValue("lastSync") as number;
  const isOnline = store.getValue("isOnline") as boolean;
  const hasPending = hasPendingChanges(store);

  return {
    lastSync: new Date(lastSync),
    isOnline,
    hasPendingChanges: hasPending,
  };
}
