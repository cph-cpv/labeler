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
    let isCancelled = false;

    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const records = await pb.collection(collection).getFullList<T>({
          filter: options.filter,
          sort: options.sort,
          expand: options.expand,
        });

        if (!isCancelled) {
          setData(records);
        }
      } catch (err) {
        if (!isCancelled) {
          // Only show error if it's not an auto-cancellation
          const errorMessage =
            err instanceof Error ? err.message : "Failed to fetch data";
          if (!errorMessage.includes("autocancelled")) {
            setError(
              err instanceof Error ? err : new Error("Failed to fetch data"),
            );
          }
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      isCancelled = true;
    };
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

/**
 * Hook for fetching a single record by ID from a PocketBase collection
 */
export function usePocketBaseRecord<T = any>(collection: string, id: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    async function fetchRecord() {
      try {
        setLoading(true);
        setError(null);
        setNotFound(false);

        const record = await pb.collection(collection).getOne<T>(id);

        if (!isCancelled) {
          setData(record);
        }
      } catch (err) {
        if (!isCancelled) {
          if (err instanceof Error && err.message.includes("404")) {
            setNotFound(true);
          } else {
            setError(
              err instanceof Error ? err : new Error("Failed to fetch record"),
            );
          }
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    if (id) {
      fetchRecord();
    }

    return () => {
      isCancelled = true;
    };
  }, [collection, id]);

  return { data, loading, error, notFound };
}
