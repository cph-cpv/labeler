import { useEffect, useState } from "react";
import { pb } from "../lib/pocketbase";

/**
 * Hook for managing PocketBase authentication state
 */
export function usePocketBaseAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(pb.authStore.isValid);
  const [user, setUser] = useState(pb.authStore.model);

  useEffect(() => {
    const unsubscribe = pb.authStore.onChange(() => {
      setIsAuthenticated(pb.authStore.isValid);
      setUser(pb.authStore.model);
    });

    return unsubscribe;
  }, []);

  return {
    isAuthenticated,
    user,
    pb,
  };
}

/**
 * Hook for fetching data from a PocketBase collection
 */
export function usePocketBaseCollection<T = any>(
  collection: string,
  options: {
    filter?: string;
    sort?: string;
    expand?: string;
    page?: number;
    perPage?: number;
  } = {},
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const records = await pb.collection(collection).getFullList<T>({
          filter: options.filter,
          sort: options.sort,
          expand: options.expand,
        });

        setData(records);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to fetch data"),
        );
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [collection, options.filter, options.sort, options.expand]);

  const refetch = async () => {
    try {
      setLoading(true);
      setError(null);

      const records = await pb.collection(collection).getFullList<T>({
        filter: options.filter,
        sort: options.sort,
        expand: options.expand,
      });

      setData(records);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch data"));
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch };
}
