import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { ChangePasswordDialog } from "./ChangePasswordDialog.tsx";
import { Button } from "./ui/button.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu.tsx";

export function AuthButton() {
  const { isAuthenticated, user, logout } = useAuth();
  const [isChangePasswordOpen, setChangePasswordOpen] = useState(false);

  function handleLogout() {
    logout();
  }

  if (!isAuthenticated) {
    return null; // Auth is handled at app level now
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            {user?.name || user?.email || "User"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem disabled>{user?.email}</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setChangePasswordOpen(true)}>
            Change Password
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleLogout}>Sign Out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ChangePasswordDialog
        open={isChangePasswordOpen}
        onOpenChange={setChangePasswordOpen}
      />
    </>
  );
}
