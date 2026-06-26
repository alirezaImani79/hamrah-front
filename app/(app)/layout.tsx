"use client";

import { AuthProvider } from "@/components/auth/auth-provider";

// Wraps the authenticated area (/login + /dashboard) in a single AuthProvider,
// nested inside the root <Providers> so RTL/DirectionProvider still applies.
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthProvider>{children}</AuthProvider>;
}
