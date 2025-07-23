import { pb } from "@/lib/pocketbase";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { RecordOptions } from "pocketbase";
import React from "react";

type PocketBaseQueryOptions = {
  sort?: string;
  expand?: string;
  filter?: string;
  fields?: string;
};

type PaginatedOptions = PocketBaseQueryOptions & {
  page?: number;
  perPage?: number;
  skipTotal?: boolean;
};

type QueryResult<T> = {
  data: T;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
};

type PaginatedResult<T> = QueryResult<T[]> & {
  totalPages?: number;
  totalItems?: number;
  page: number;
  perPage: number;
};

// Collection queries
export function usePocketBaseCollection<T>(
  collection: string,
  options: PocketBaseQueryOptions = {},
): QueryResult<T[]> {
  const queryResult = useQuery({
    queryKey: ["pocketbase", collection, options],
    queryFn: async () => {
      const queryOptions: RecordOptions = {};
      if (options.sort) queryOptions.sort = options.sort;
      if (options.expand) queryOptions.expand = options.expand;
      if (options.filter) queryOptions.filter = options.filter;
      if (options.fields) queryOptions.fields = options.fields;

      return await pb.collection(collection).getFullList<T>(queryOptions);
    },
    staleTime: 30 * 1000, // 30 seconds
    retry: (failureCount, error) => {
      // Don't retry on PocketBase auto-cancellation errors
      if (error?.name === "ClientResponseError" && error?.isAbort) {
        return false;
      }
      return failureCount < 2;
    },
  });

  return {
    data: queryResult.data ?? [],
    isLoading: queryResult.isPending,
    error: queryResult.error,
    refetch: queryResult.refetch,
  };
}

// Single record queries
export function usePocketBaseRecord<T>(
  collection: string,
  id: string,
  options: PocketBaseQueryOptions = {},
): QueryResult<T | null> {
  const queryResult = useQuery({
    queryKey: ["pocketbase", collection, id, options],
    queryFn: async () => {
      const queryOptions: RecordOptions = {};
      if (options.expand) queryOptions.expand = options.expand;
      if (options.fields) queryOptions.fields = options.fields;

      return await pb.collection(collection).getOne<T>(id, queryOptions);
    },
    enabled: !!id,
    staleTime: 30 * 1000,
  });

  return {
    data: queryResult.data ?? null,
    isLoading: queryResult.isPending,
    error: queryResult.error,
    refetch: queryResult.refetch,
  };
}

// Paginated queries
export function usePocketBasePaginated<T>(
  collection: string,
  options: PaginatedOptions = {},
): PaginatedResult<T> {
  const {
    page = 1,
    perPage = 20,
    skipTotal = false,
    ...queryOptions
  } = options;

  const queryResult = useQuery({
    queryKey: [
      "pocketbase",
      collection,
      "paginated",
      { page, perPage, skipTotal, ...queryOptions },
    ],
    queryFn: async () => {
      const recordOptions: RecordOptions = {};
      if (queryOptions.sort) recordOptions.sort = queryOptions.sort;
      if (queryOptions.expand) recordOptions.expand = queryOptions.expand;
      if (queryOptions.filter) recordOptions.filter = queryOptions.filter;
      if (queryOptions.fields) recordOptions.fields = queryOptions.fields;
      if (skipTotal) recordOptions.skipTotal = skipTotal;

      return await pb
        .collection(collection)
        .getList<T>(page, perPage, recordOptions);
    },
    staleTime: 30 * 1000, // 30 seconds
    placeholderData: (previousData) => previousData, // Keep previous data while loading new page
  });

  const result = queryResult.data;

  return {
    data: result?.items ?? [],
    isLoading: queryResult.isPending,
    error: queryResult.error,
    refetch: queryResult.refetch,
    totalPages: result?.totalPages ?? 1, // Default to 1 when skipTotal is used
    totalItems: result?.totalItems,
    page,
    perPage,
  };
}

// Count queries
export function usePocketBaseCount(
  collection: string,
  filter = "",
): QueryResult<number> {
  const queryResult = useQuery({
    queryKey: ["pocketbase", collection, "count", filter],
    queryFn: async () => {
      const options = filter ? { filter } : undefined;
      const result = await pb.collection(collection).getList(1, 1, {
        ...options,
        fields: "id", // Only fetch id to minimize data transfer
      });
      return result.totalItems;
    },
    staleTime: 60 * 1000, // 1 minute
  });

  return {
    data: queryResult.data ?? 0,
    isLoading: queryResult.isPending,
    error: queryResult.error,
    refetch: queryResult.refetch,
  };
}

// Auth state
export function usePocketBaseAuth() {
  const queryClient = useQueryClient();

  const queryResult = useQuery({
    queryKey: ["pocketbase", "auth"],
    queryFn: () => {
      return {
        isAuthenticated: pb.authStore.isValid,
        user: pb.authStore.model,
        token: pb.authStore.token,
      };
    },
    staleTime: Infinity, // Auth state changes are handled by events
    refetchOnWindowFocus: false,
  });

  // Listen for auth changes and invalidate auth query
  React.useEffect(() => {
    const unsubscribe = pb.authStore.onChange(() => {
      queryClient.invalidateQueries({ queryKey: ["pocketbase", "auth"] });
    });

    return unsubscribe;
  }, [queryClient]);

  const login = useMutation({
    mutationFn: async ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }) => {
      return await pb.collection("users").authWithPassword(email, password);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pocketbase", "auth"] });
    },
  });

  const logout = useMutation({
    mutationFn: async () => {
      pb.authStore.clear();
    },
    onSuccess: () => {
      queryClient.clear(); // Clear all cached data on logout
    },
  });

  return {
    isAuthenticated: queryResult.data?.isAuthenticated ?? false,
    user: queryResult.data?.user,
    token: queryResult.data?.token,
    isLoading: queryResult.isPending,
    error: queryResult.error,
    login: login.mutate,
    logout: logout.mutate,
    isLoginLoading: login.isPending,
    isLogoutLoading: logout.isPending,
  };
}

// Mutation hooks for CRUD operations
export function usePocketBaseMutation<T>(collection: string) {
  const queryClient = useQueryClient();

  const create = useMutation({
    mutationFn: async (data: Partial<T>) => {
      return await pb.collection(collection).create<T>(data);
    },
    onSuccess: () => {
      // Invalidate collection queries
      queryClient.invalidateQueries({ queryKey: ["pocketbase", collection] });
    },
  });

  const update = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<T> }) => {
      return await pb.collection(collection).update<T>(id, data);
    },
    onSuccess: (updatedRecord) => {
      // Invalidate collection queries
      queryClient.invalidateQueries({ queryKey: ["pocketbase", collection] });
      // Update specific record in cache
      queryClient.setQueryData(
        ["pocketbase", collection, updatedRecord.id],
        updatedRecord,
      );
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      return await pb.collection(collection).delete(id);
    },
    onSuccess: (_, id) => {
      // Invalidate collection queries
      queryClient.invalidateQueries({ queryKey: ["pocketbase", collection] });
      // Remove specific record from cache
      queryClient.removeQueries({ queryKey: ["pocketbase", collection, id] });
    },
  });

  return {
    create: create.mutate,
    update: update.mutate,
    remove: remove.mutate,
    isCreating: create.isPending,
    isUpdating: update.isPending,
    isRemoving: remove.isPending,
    createError: create.error,
    updateError: update.error,
    removeError: remove.error,
  };
}
