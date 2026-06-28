"use client";

import { BadgeCheck, Clock, ShieldAlert } from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";

/**
 * Surfaces the identity verification state on the dashboard: a "we're reviewing
 * your info" note while verifying, and the rejection reason if it was rejected.
 * Renders nothing for verified/pending users.
 */
export default function IdentityStatusBanner() {
  const { user } = useAuth();
  if (!user) return null;

  if (user.identity_status === "verifying") {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-accent-300/50 bg-accent-300/10 px-4 py-3.5">
        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-accent-300/20 text-accent-700">
          <Clock className="size-4" />
        </span>
        <div className="flex flex-col gap-0.5">
          <p className="font-medium text-foreground">هویتت در حال بررسیه</p>
          <p className="text-sm leading-7 text-muted-foreground">
            اطلاعات و مدارکت رو دریافت کردیم و داریم بررسیشون می‌کنیم. به‌محض
            تأیید، با پیامک خبردارت می‌کنیم.
          </p>
        </div>
      </div>
    );
  }

  if (user.identity_status === "rejected") {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3.5">
        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <ShieldAlert className="size-4" />
        </span>
        <div className="flex flex-col gap-0.5">
          <p className="font-medium text-foreground">تأیید هویت ناموفق بود</p>
          <p className="text-sm leading-7 text-muted-foreground">
            {user.identity_rejection_reason ??
              "اطلاعات یا مدارکت تأیید نشد؛ لطفاً دوباره و با دقت بیشتری اقدام کن."}
          </p>
        </div>
      </div>
    );
  }

  if (user.identity_status === "verified") {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-brand-200 bg-brand-50/60 px-4 py-3.5">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700">
          <BadgeCheck className="size-4" />
        </span>
        <p className="font-medium text-brand-800">هویتت تأیید شده</p>
      </div>
    );
  }

  return null;
}
