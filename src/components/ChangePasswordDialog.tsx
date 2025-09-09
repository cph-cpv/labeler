import { Button } from "@/components/ui/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { useAuth } from "@/hooks/useAuth.ts";
import { useForm } from "@tanstack/react-form";
import { useState } from "react";

type ChangePasswordDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ChangePasswordDialog({
  open,
  onOpenChange,
}: ChangePasswordDialogProps) {
  const {
    changePassword: changePasswordAsync,
    isChangingPassword,
    changePasswordError,
  } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      newPasswordConfirm: "",
    },
    onSubmit: async ({ value }) => {
      if (value.newPassword !== value.newPasswordConfirm) {
        setFormError("New passwords do not match.");
        return;
      }
      setFormError(null);
      try {
        await changePasswordAsync({
          oldPassword: value.oldPassword,
          newPassword: value.newPassword,
          newPasswordConfirm: value.newPasswordConfirm,
        });
        onOpenChange(false);
      } catch (err) {
        // The error is handled by the changePasswordError state
      }
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
          <DialogDescription>
            Enter your old password and a new password.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <div className="space-y-4">
            <form.Field name="oldPassword">
              {(field) => (
                <div>
                  <Label htmlFor={field.name}>Old Password</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    type="password"
                  />
                </div>
              )}
            </form.Field>
            <form.Field name="newPassword">
              {(field) => (
                <div>
                  <Label htmlFor={field.name}>New Password</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    type="password"
                  />
                </div>
              )}
            </form.Field>
            <form.Field name="newPasswordConfirm">
              {(field) => (
                <div>
                  <Label htmlFor={field.name}>Confirm New Password</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    type="password"
                  />
                </div>
              )}
            </form.Field>
            {(formError || changePasswordError) && (
              <p className="text-red-500">
                {formError || (changePasswordError as Error).message}
              </p>
            )}
            <Button type="submit" disabled={isChangingPassword}>
              {isChangingPassword ? "Changing..." : "Change Password"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
