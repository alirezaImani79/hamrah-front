"use client";

import { useState } from "react";
import { Loader2, LogOut, Sprout } from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import { toPersianDigits } from "@/lib/format";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function DashboardTopbar() {
  const { user, signOut } = useAuth();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const fullName = [user?.first_name, user?.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();
  const displayName =
    fullName || user?.name?.trim() || user?.phone_number || "کاربر";

  async function handleSignOut() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      // Revokes the token server-side, then redirects to /login.
      await signOut();
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <div className="flex items-center gap-2 text-xl font-extrabold text-brand-700">
          <Sprout className="size-6" />
          همراه
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-muted-foreground sm:inline">
            سلام،{" "}
            <span dir="ltr" className="font-medium text-foreground">
              {toPersianDigits(displayName)}
            </span>
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setConfirmOpen(true)}
            className="gap-1.5 text-muted-foreground hover:text-destructive"
          >
            <LogOut className="size-4" />
            خروج
          </Button>
        </div>
      </div>

      <AlertDialog
        open={confirmOpen}
        onOpenChange={(open) => {
          // Don't let the dialog close while the sign-out request is in flight.
          if (!loggingOut) setConfirmOpen(open);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>خروج از حساب</AlertDialogTitle>
            <AlertDialogDescription>
              مطمئنی می‌خوای از حساب کاربری‌ت خارج بشی؟ برای ادامه باید دوباره
              وارد بشی.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              disabled={loggingOut}
              className="rounded-xl"
            >
              انصراف
            </Button>
            <Button
              variant="destructive"
              onClick={handleSignOut}
              disabled={loggingOut}
              className="gap-1.5 rounded-xl"
            >
              {loggingOut ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <LogOut className="size-4" />
              )}
              {loggingOut ? "در حال خروج…" : "خروج از حساب"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </header>
  );
}
