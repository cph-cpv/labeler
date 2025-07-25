import { pb } from "@/lib/pocketbase";
import type { ClientResponseError, PocketBaseError } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { RecordOptions } from "pocketbase";

const POCKETBASE_PER_PAGE = 50;

type QueryResult<T> = {
  data: T;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
};

type PocketBaseQueryResult<T> = {
  data: T;
  isLoading: boolean;
  error: PocketBaseError | null;
  refetch: () => void;
};

type PaginatedOptions = PocketBaseQueryOptions & {
  page?: number;
  skipTotal?: boolean;
};

type PaginatedResult<T> = QueryResult<T[]> & {
  totalPages?: number;
  totalItems?: number;
  page: number;
  perPage: number;
};

type PocketBaseQueryOptions = {
  sort?: string;
  expand?: string;
  filter?: string;
  fields?: string;
};

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
      if (
        error?.name === "ClientResponseError" &&
        (error as ClientResponseError)?.isAbort
      ) {
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
): PocketBaseQueryResult<T | null> {
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

  function createPocketBaseError(error: Error | null): PocketBaseError | null {
    if (!error) return null;

    // Check if it's already a ClientResponseError from PocketBase
    if (error.name === "ClientResponseError") {
      const clientError = error as ClientResponseError;
      return {
        ...clientError,
        notFound: clientError.status === 404,
      };
    }

    // For other errors, create a minimal PocketBaseError
    return {
      ...error,
      url: "",
      status: 0,
      response: {},
      isAbort: false,
      originalError: error,
      notFound: false,
    };
  }

  const pocketBaseError = createPocketBaseError(queryResult.error);

  return {
    data: queryResult.data ?? null,
    isLoading: queryResult.isPending,
    error: pocketBaseError,
    refetch: queryResult.refetch,
  };
}

// Paginated queries
export function usePocketBasePaginated<T>(
  collection: string,
  options: PaginatedOptions = {},
): PaginatedResult<T> {
  const { page = 1, skipTotal = false, ...queryOptions } = options;

  const queryResult = useQuery({
    queryKey: [
      "pocketbase",
      collection,
      "paginated",
      { page, skipTotal, ...queryOptions },
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
        .getList<T>(page, POCKETBASE_PER_PAGE, recordOptions);
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
    perPage: POCKETBASE_PER_PAGE,
  };
}

// Mutation hooks for CRUD operations
export function usePocketBaseMutation<T extends { id: string }>(
  collection: string,
) {
  const queryClient = useQueryClient();

  const create = useMutation({
    mutationFn: async (data: Partial<T>) => {
      return await pb.collection(collection).create<T>(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pocketbase", collection] });
    },
  });

  const update = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<T> }) => {
      return await pb.collection(collection).update<T>(id, data);
    },
    onSuccess: (updatedRecord) => {
      queryClient.invalidateQueries({ queryKey: ["pocketbase", collection] });
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
      queryClient.invalidateQueries({ queryKey: ["pocketbase", collection] });
      queryClient.removeQueries({ queryKey: ["pocketbase", collection, id] });
    },
  });

  return {
    create: create.mutate,
    createAsync: create.mutateAsync,
    update: update.mutate,
    updateAsync: update.mutateAsync,
    remove: remove.mutate,
    removeAsync: remove.mutateAsync,
    isCreating: create.isPending,
    isUpdating: update.isPending,
    isRemoving: remove.isPending,
    createError: create.error,
    updateError: update.error,
    removeError: remove.error,
  };
}

// Hook to get first matching record by filter
export function usePocketBaseFirst<T>(
  collection: string,
  filter: string | null,
  options: PocketBaseQueryOptions = {},
): { data: T | null; isLoading: boolean; error: Error | null } {
  const queryResult = useQuery({
    queryKey: ["pocketbase", collection, "first", filter, options],
    queryFn: async () => {
      if (!filter) return null;

      const queryOptions: RecordOptions = {};
      if (options.sort) queryOptions.sort = options.sort;
      if (options.expand) queryOptions.expand = options.expand;
      if (options.fields) queryOptions.fields = options.fields;

      return await pb
        .collection(collection)
        .getFirstListItem<T>(filter, queryOptions);
    },
    enabled: !!filter,
    staleTime: 30 * 1000,
  });

  return {
    data: queryResult.data ?? null,
    isLoading: queryResult.isPending,
    error: queryResult.error,
  };
}

// Batch update mutation for multiple records
export function usePocketBaseBatchUpdate<T extends { id: string }>(
  collection: string,
) {
  const queryClient = useQueryClient();

  const batchUpdate = useMutation({
    mutationFn: async ({
      updates,
    }: {
      updates: Array<{ id: string; data: Partial<T> }>;
    }) => {
      const results = await Promise.all(
        updates.map(({ id, data }) =>
          pb.collection(collection).update<T>(id, data),
        ),
      );
      return { results, updates };
    },
    onSuccess: ({ results, updates }) => {
      queryClient.invalidateQueries({ queryKey: ["pocketbase", collection] });
      results.forEach((updatedRecord, index) => {
        queryClient.setQueryData(
          ["pocketbase", collection, updates[index].id],
          updatedRecord,
        );
      });
    },
  });

  return {
    batchUpdate: batchUpdate.mutate,
    batchUpdateAsync: batchUpdate.mutateAsync,
    isBatchUpdating: batchUpdate.isPending,
    batchUpdateError: batchUpdate.error,
  };
}
