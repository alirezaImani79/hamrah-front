import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { Loader2, Sprout } from "lucide-react";

import OtpLoginForm from "@/components/auth/otp-login-form";

export const metadata: Metadata = {
  title: "ورود | همراه",
  description: "ورود به حساب کاربری همراه با کد یک‌بار‌مصرف.",
};

function FormFallback() {
  return (
    <div className="flex h-64 items-center justify-center">
      <Loader2 className="size-6 animate-spin text-muted-foreground" />
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-brand-50 via-background to-background px-5 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 start-1/2 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-brand-300/30 blur-3xl"
      />

      <Link
        href="/"
        className="mb-8 flex items-center gap-2 text-2xl font-extrabold text-brand-700"
      >
        <Sprout className="size-7" />
        همراه
      </Link>

      <div className="w-full max-w-sm rounded-[1.75rem] border border-brand-100 bg-card/80 p-7 shadow-xl shadow-brand-600/5 backdrop-blur-sm sm:p-8">
        <Suspense fallback={<FormFallback />}>
          <OtpLoginForm />
        </Suspense>
      </div>

      <p className="mt-6 max-w-xs text-center text-xs leading-6 text-muted-foreground">
        با ورود، با قوانین و سیاست حریم خصوصی همراه موافقت می‌کنی.
      </p>
    </main>
  );
}
