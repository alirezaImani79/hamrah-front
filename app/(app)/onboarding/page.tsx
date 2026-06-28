import type { Metadata } from "next";
import Link from "next/link";
import { Sprout } from "lucide-react";

import OnboardingFlow from "@/components/onboarding/onboarding-flow";

export const metadata: Metadata = {
  title: "تکمیل حساب | همراه",
  description: "تکمیل اطلاعات و تأیید هویت برای استفاده از همراه.",
};

export default function OnboardingPage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center overflow-hidden bg-gradient-to-b from-brand-50 via-background to-background px-5 py-12">
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

      <div className="w-full max-w-lg rounded-[1.75rem] border border-brand-100 bg-card/80 p-6 shadow-xl shadow-brand-600/5 backdrop-blur-sm sm:p-8">
        <OnboardingFlow />
      </div>
    </main>
  );
}
