"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { needsIdentityOnboarding } from "@/lib/identity";
import { useAuth } from "@/components/auth/auth-provider";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { status, user } = useAuth();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    } else if (status === "authenticated" && user && !needsIdentityOnboarding(user)) {
      // Already submitted (verifying/verified/rejected) — nothing to do here.
      router.replace("/dashboard");
    }
  }, [status, user, router]);

  if (status !== "authenticated" || (user && !needsIdentityOnboarding(user))) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30">
        <Loader2 className="size-7 animate-spin text-brand-600" />
      </div>
    );
  }

  return <>{children}</>;
}
