import { useEffect } from "react";
import { QueryClient } from "@tanstack/react-query";

export function useReactQueryStorage(
  queryClient: QueryClient,
  storageType: "local" | "session" = "local",
  ttlMs: number = 24 * 60 * 60 * 1000 // 24 hours
) {
  const storage = storageType === "local" ? localStorage : sessionStorage;
  const STORAGE_KEY = "react_query_cache_v4";

  useEffect(() => {
    console.log("🟡 React Query Storage + TTL initialized");

    // -------- RESTORE --------
    try {
      const saved = storage.getItem(STORAGE_KEY);

      if (saved) {
        const parsed = JSON.parse(saved);

        const now = Date.now();

        parsed.forEach((item: any) => {
          // Skip expired entries
          if (now - item.timestamp > ttlMs) {
            //  console.log(`⏳ Deleted expired cache for`, item.queryKey);
            return;
          }

          if (item.queryKey && item.data !== undefined) {
            queryClient.setQueryData(item.queryKey, item.data);
          }
        });

        // console.log("🔄 Restored Cached Queries:", parsed);
      }
    } catch (err) {
      console.warn("⚠ Failed to restore cache", err);
    }

    // -------- SAVE CACHE --------
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event?.type === "updated") {
        const queries = queryClient.getQueryCache().findAll();

        const toStore = queries
          .filter((q) => q.state.data !== undefined)
          .map((q) => ({
            queryKey: q.queryKey,
            data: q.state.data,
            timestamp: Date.now(), // ⏱ store save time
          }));

        storage.setItem(STORAGE_KEY, JSON.stringify(toStore));

        // console.log("💾 Cache Saved:", toStore);
      }
    });

    return unsubscribe;
  }, [queryClient]);
}
