"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { X, AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { deleteAccount } from "@/app/auth/actions";
import { PasswordInput } from "@/components/ui/PasswordInput";

export function SettingsTab() {
  const router = useRouter();
  const supabase = createClient();

  // ── Notification prefs ─────────────────────────────────────────────────────
  const [emailNotifications, setEmailNotifications] = React.useState(true);
  const [smsNotifications, setSmsNotifications] = React.useState(false);

  // ── Password change ────────────────────────────────────────────────────────
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [passwordLoading, setPasswordLoading] = React.useState(false);
  const [passwordMessage, setPasswordMessage] = React.useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // ── Delete account ─────────────────────────────────────────────────────────
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = React.useState("");
  const [deleteLoading, setDeleteLoading] = React.useState(false);

  // ── Helpers ────────────────────────────────────────────────────────────────
  function validatePassword(pw: string): string | null {
    if (pw.length < 8) return "Password must be at least 8 characters.";
    if (!/[0-9]/.test(pw)) return "Password must contain at least one number.";
    if (!/[^A-Za-z0-9]/.test(pw))
      return "Password must contain at least one special character.";
    return null;
  }

  // ── Password submit ────────────────────────────────────────────────────────
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);

    // Validate new password strength
    const validationError = validatePassword(newPassword);
    if (validationError) {
      setPasswordMessage({ type: "error", text: validationError });
      return;
    }

    // Confirm match
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "New passwords do not match." });
      return;
    }

    setPasswordLoading(true);
    try {
      // Re-authenticate: sign in with current password
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user?.email) {
        setPasswordMessage({ type: "error", text: "Not authenticated." });
        setPasswordLoading(false);
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (signInError) {
        setPasswordMessage({
          type: "error",
          text: "Current password is incorrect.",
        });
        setPasswordLoading(false);
        return;
      }

      // Update to new password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setPasswordMessage({ type: "error", text: updateError.message });
      } else {
        // Logout and redirect to login for security
        await supabase.auth.signOut();
        router.push("/auth/login");
        return;
      }
    } catch {
      setPasswordMessage({ type: "error", text: "Failed to update password." });
    } finally {
      setPasswordLoading(false);
    }
  };

  // ── Delete account ─────────────────────────────────────────────────────────
  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      await deleteAccount();
    } catch {
      setDeleteLoading(false);
    }
  };

  // ── Strength indicator ─────────────────────────────────────────────────────
  function getPasswordStrength(pw: string) {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (/[A-Z]/.test(pw)) score++;
    return score;
  }

  const passwordStrength = getPasswordStrength(newPassword);
  const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];
  const strengthColors = [
    "",
    "bg-red-500",
    "bg-amber-500",
    "bg-blue-500",
    "bg-emerald-500",
  ];

  return (
    <div className="flex flex-col gap-10">
      {/* ── Email Preferences ─────────────────────────────────────────────── */}
      <div>
        <h2 className="font-serif text-xl font-semibold text-foreground mb-6">
          Email Preferences
        </h2>
        <div className="flex flex-col gap-4 max-w-lg">
          <label className="flex items-center justify-between gap-4 cursor-pointer">
            <div>
              <p className="text-sm font-medium text-foreground">New arrivals</p>
              <p className="text-xs text-muted-foreground">
                Get notified when new products drop
              </p>
            </div>
            <input
              type="checkbox"
              checked={emailNotifications}
              onChange={(e) => setEmailNotifications(e.target.checked)}
              className="size-4 rounded border-border accent-gold"
            />
          </label>
          <label className="flex items-center justify-between gap-4 cursor-pointer">
            <div>
              <p className="text-sm font-medium text-foreground">
                Sales & promotions
              </p>
              <p className="text-xs text-muted-foreground">
                Exclusive offers and discount codes
              </p>
            </div>
            <input
              type="checkbox"
              checked={emailNotifications}
              onChange={(e) => setEmailNotifications(e.target.checked)}
              className="size-4 rounded border-border accent-gold"
            />
          </label>
          <label className="flex items-center justify-between gap-4 cursor-pointer">
            <div>
              <p className="text-sm font-medium text-foreground">
                SMS notifications
              </p>
              <p className="text-xs text-muted-foreground">
                Order updates via text message
              </p>
            </div>
            <input
              type="checkbox"
              checked={smsNotifications}
              onChange={(e) => setSmsNotifications(e.target.checked)}
              className="size-4 rounded border-border accent-gold"
            />
          </label>
        </div>
      </div>

      {/* ── Change Password ───────────────────────────────────────────────── */}
      <div>
        <h2 className="font-serif text-xl font-semibold text-foreground mb-2">
          Change Password
        </h2>
        <p className="text-sm text-muted-foreground mb-6 max-w-lg">
          For your security, you must enter your current password before making
          changes.
        </p>
        <form
          onSubmit={handlePasswordChange}
          className="flex flex-col gap-4 max-w-lg"
        >
          {/* Current password */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Current Password
            </label>
            <PasswordInput
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              autoComplete="current-password"
              className="w-full px-4 py-3 bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold transition-colors"
            />
          </div>

          {/* New password */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              New Password
            </label>
            <PasswordInput
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min. 8 characters"
              autoComplete="new-password"
              className="w-full px-4 py-3 bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold transition-colors"
            />
            {/* Strength bar */}
            {newPassword.length > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 flex gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        i <= passwordStrength
                          ? strengthColors[passwordStrength]
                          : "bg-muted"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-[11px] font-medium text-muted-foreground">
                  {strengthLabels[passwordStrength]}
                </span>
              </div>
            )}
            {/* Validation hints */}
            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
              {[
                { test: newPassword.length >= 8, label: "8+ characters" },
                { test: /[0-9]/.test(newPassword), label: "One number" },
                {
                  test: /[^A-Za-z0-9]/.test(newPassword),
                  label: "Special character",
                },
              ].map((hint) => (
                <span
                  key={hint.label}
                  className={`text-[11px] ${
                    newPassword.length === 0
                      ? "text-muted-foreground"
                      : hint.test
                        ? "text-emerald-500"
                        : "text-red-500"
                  }`}
                >
                  {hint.test ? "\u2713" : "\u2717"} {hint.label}
                </span>
              ))}
            </div>
          </div>

          {/* Confirm password */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Confirm New Password
            </label>
            <PasswordInput
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              autoComplete="new-password"
              className="w-full px-4 py-3 bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold transition-colors"
            />
            {confirmPassword.length > 0 && confirmPassword !== newPassword && (
              <p className="mt-1 text-[11px] text-red-500">Passwords do not match</p>
            )}
          </div>

          {/* Feedback */}
          {passwordMessage && (
            <p
              className={`text-sm ${
                passwordMessage.type === "error"
                  ? "text-red-500"
                  : "text-emerald-500"
              }`}
            >
              {passwordMessage.text}
            </p>
          )}

          <button
            type="submit"
            disabled={
              passwordLoading ||
              !currentPassword ||
              !newPassword ||
              !confirmPassword
            }
            className="self-start px-8 py-3 bg-foreground text-background text-xs font-semibold tracking-[0.2em] uppercase hover:bg-gold hover:text-foreground transition-colors disabled:opacity-50"
          >
            {passwordLoading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>

      {/* ── Delete Account ────────────────────────────────────────────────── */}
      <div className="pt-8 border-t border-border">
        <h2 className="font-serif text-xl font-semibold text-red-500 mb-2">
          Delete Account
        </h2>
        <p className="text-sm text-muted-foreground mb-6 max-w-lg">
          Permanently delete your account and all associated data. This action
          cannot be undone.
        </p>
        <Dialog.Root open={deleteOpen} onOpenChange={setDeleteOpen}>
          <Dialog.Trigger asChild>
            <button className="px-6 py-3 border border-red-500 text-red-500 text-xs font-semibold tracking-wider uppercase hover:bg-red-500 hover:text-white transition-colors">
              Delete Account
            </button>
          </Dialog.Trigger>

          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
            <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white dark:bg-zinc-950 p-6 sm:p-8 shadow-2xl border border-border data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center size-10 rounded-full bg-red-50 dark:bg-red-950/30">
                  <AlertTriangle className="size-5 text-red-500" />
                </div>
                <Dialog.Title className="text-lg font-serif font-semibold text-foreground">
                  Delete Account
                </Dialog.Title>
              </div>

              <Dialog.Description asChild>
                <div className="text-sm text-muted-foreground mb-6 space-y-3">
                  <p>
                    You are about to permanently delete your account. This will
                    remove:
                  </p>
                  <ul className="list-disc list-inside text-xs space-y-1 text-muted-foreground">
                    <li>Your profile and account details</li>
                    <li>Your order history</li>
                    <li>Your wishlist items</li>
                    <li>Your product reviews</li>
                  </ul>
                  <p className="font-medium text-red-500">
                    This action is irreversible. You will not be able to recover
                    your account or any of this data.
                  </p>
                </div>
              </Dialog.Description>

              {/* Type-to-confirm */}
              <div className="mb-6">
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Type <span className="font-semibold text-foreground">DELETE</span> to
                  confirm
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="DELETE"
                  className="w-full px-4 py-3 bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteLoading || deleteConfirmText !== "DELETE"}
                  className="flex-1 px-6 py-3 bg-red-500 text-white text-xs font-semibold tracking-wider uppercase hover:bg-red-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {deleteLoading ? "Deleting..." : "Yes, Delete My Account"}
                </button>
                <Dialog.Close asChild>
                  <button className="flex-1 px-6 py-3 border border-border text-foreground text-xs font-semibold tracking-wider uppercase hover:border-gold transition-colors">
                    Cancel
                  </button>
                </Dialog.Close>
              </div>

              <Dialog.Close asChild>
                <button
                  className="absolute right-4 top-4 p-1 rounded-full text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Close"
                >
                  <X className="size-4" />
                </button>
              </Dialog.Close>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </div>
  );
}
