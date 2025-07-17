import type { AuthModel } from "pocketbase";
import { createContext, useContext, useEffect, useState } from "react";
import { pb } from "../lib/pocketbase";

interface AuthContextType {
  user: AuthModel | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthModel | null>(pb.authStore.model);
  const [isAuthenticated, setIsAuthenticated] = useState(pb.authStore.isValid);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = pb.authStore.onChange(() => {
      setUser(pb.authStore.model);
      setIsAuthenticated(pb.authStore.isValid);
    });

    // Check if we have a valid auth on mount
    if (pb.authStore.isValid) {
      // Verify the token is still valid
      pb.collection("users")
        .authRefresh()
        .catch(() => {
          pb.authStore.clear();
        });
    }

    setIsLoading(false);

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    try {
      await pb.collection("users").authWithPassword(email, password);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : "Login failed");
    }
  };

  const logout = () => {
    pb.authStore.clear();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
