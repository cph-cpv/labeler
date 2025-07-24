import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { Button } from "./ui/button.tsx";
import { Input } from "./ui/input.tsx";
import { Label } from "./ui/label.tsx";

interface LoginFormProps {
  onSuccess?: () => void;
}

export function AuthLogin({ onSuccess }: LoginFormProps) {
  const { loginAsync, isLoggingIn, loginError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      await loginAsync({ email, password });
      onSuccess?.();
    } catch (err) {
      // Error is handled by the mutation
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoggingIn}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isLoggingIn}
        />
      </div>

      {loginError && (
        <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
          {loginError.message}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isLoggingIn}>
        {isLoggingIn ? "Signing in..." : "Sign In"}
      </Button>
    </form>
  );
}
