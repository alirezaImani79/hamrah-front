"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import DashboardTopbar from "@/components/dashboard/dashboard-topbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { status } = useAuth();

  // Secure check failed (no/invalid token) → bounce to login.
  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  if (status !== "authenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30">
        <Loader2 className="size-7 animate-spin text-brand-600" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <DashboardTopbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-8 sm:px-8">
        {children}
      </main>
    </div>
  );
}
