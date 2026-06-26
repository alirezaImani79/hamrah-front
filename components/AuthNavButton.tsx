"use client";

import Link from "next/link";
import { LayoutDashboard } from "lucide-react";

import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth/auth-provider";
import { buttonVariants } from "@/components/ui/button";

// The landing nav CTA, aware of the session. Logged-in visitors get a shortcut
// to their dashboard instead of the login/register link. Auth resolves only on
// the client (the token cookie isn't readable during SSR), so the first render
// is always "loading" on both server and client — a skeleton keeps hydration
// stable and avoids a login → dashboard flash for signed-in users.
export default function AuthNavButton() {
  const { status } = useAuth();

  if (status === "loading") {
    return (
      <span
        aria-hidden
        className="h-9 w-28 animate-pulse rounded-full bg-muted"
      />
    );
  }

  if (status === "authenticated") {
    return (
      <Link
        href="/dashboard"
        className={cn(
          buttonVariants({ variant: "default" }),
          "h-9 gap-1.5 rounded-full px-5"
        )}
      >
        <LayoutDashboard className="size-4" />
        داشبورد من
      </Link>
    );
  }

  return (
    <Link
      href="/login"
      className={cn(
        buttonVariants({ variant: "default" }),
        "h-9 rounded-full px-5"
      )}
    >
      ورود / ثبت‌نام
    </Link>
  );
}
