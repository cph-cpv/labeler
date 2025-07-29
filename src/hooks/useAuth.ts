import { pb } from "@/lib/pocketbase";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AuthModel } from "pocketbase";

type AuthState = {
  user: AuthModel | null;
  isAuthenticated: boolean;
};

type LoginCredentials = {
  email: string;
  password: string;
};

export function useAuth() {
  const queryClient = useQueryClient();

  // Query for current auth state
  const authQuery = useQuery({
    queryKey: ["auth"],
    queryFn: async (): Promise<AuthState> => {
      // Check if we have a stored auth
      if (pb.authStore.isValid && pb.authStore.record) {
        try {
          // Verify the token is still valid by refreshing it
          await pb.collection("users").authRefresh();
          return {
            user: pb.authStore.record,
            isAuthenticated: true,
          };
        } catch {
          // Token is invalid, clear it
          pb.authStore.clear();
        }
      }

      return {
        user: null,
        isAuthenticated: false,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // Don't retry auth checks
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: LoginCredentials) => {
      const authData = await pb
        .collection("users")
        .authWithPassword(email, password);
      return {
        user: authData.record,
        isAuthenticated: true,
      };
    },
    onSuccess: (authState) => {
      // Update the auth query cache
      queryClient.setQueryData(["auth"], authState);
      // Invalidate all PocketBase queries to refetch with new auth
      queryClient.invalidateQueries({ queryKey: ["pocketbase"] });
    },
    onError: () => {
      // Clear any stale auth data on login failure
      pb.authStore.clear();
      queryClient.setQueryData(["auth"], {
        user: null,
        isAuthenticated: false,
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      pb.authStore.clear();
      return {
        user: null,
        isAuthenticated: false,
      };
    },
    onSuccess: (authState) => {
      // Update the auth query cache
      queryClient.setQueryData(["auth"], authState);
      // Invalidate all PocketBase queries to refetch without auth
      queryClient.invalidateQueries({ queryKey: ["pocketbase"] });
    },
  });

  return {
    // Auth state
    user: authQuery.data?.user ?? null,
    isAuthenticated: authQuery.data?.isAuthenticated ?? false,
    isLoading: authQuery.isPending,
    error: authQuery.error,

    // Auth actions
    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    logout: logoutMutation.mutate,

    // Mutation states
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    loginError: loginMutation.error,
    logoutError: logoutMutation.error,

    // Utility functions
    refetch: authQuery.refetch,
  };
}
