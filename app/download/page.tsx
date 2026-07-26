import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Download,
  Info,
  Smartphone,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { toPersianDigits } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  APP_APK_FILENAME,
  APP_APK_HREF,
  APP_VERSION,
  formatAppSize,
} from "@/lib/app-download";

export const metadata: Metadata = {
  title: "دانلود اپلیکیشن همراه | نسخه اندروید",
  description:
    "اپلیکیشن همراه را مستقیم و بدون نیاز به مراجعه به فروشگاه برنامه دانلود کنید. فایل APK رسمی برای اندروید.",
  openGraph: {
    title: "دانلود اپلیکیشن همراه | نسخه اندروید",
    description:
      "دانلود مستقیم فایل APK همراه برای اندروید؛ نصب سریع و بدون واسطه.",
    type: "website",
  },
};

const installSteps = [
  {
    title: "فایل APK را دانلود کن",
    desc: "روی دکمهٔ «دانلود مستقیم» بزن تا فایل نصبی روی گوشیت ذخیره بشه.",
  },
  {
    title: "فایل را باز کن",
    desc: "از پوشهٔ دانلودها روی hamrah.apk ضربه بزن تا نصب شروع بشه.",
  },
  {
    title: "اجازهٔ نصب بده",
    desc: "اگه هشدار «نصب از منبع ناشناخته» دیدی، از تنظیمات گوشی اجازه بده.",
  },
  {
    title: "وارد اپ بشو",
    desc: "اپ همراه را باز کن، با شماره موبایل وارد شو و به هم‌سفرها بپیوند.",
  },
];

export default function DownloadPage() {
  return (
    <header className="relative isolate overflow-hidden bg-gradient-to-b from-brand-50 via-background to-background">
      {/* Soft floating glows, matching the landing hero. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 start-1/2 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-brand-300/40 blur-3xl animate-float-slow"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-40 end-0 -z-10 h-64 w-64 rounded-full bg-accent-300/30 blur-3xl animate-float-slow"
      />

      <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-7 px-5 pb-20 pt-16 text-center sm:px-8 sm:pt-24">
        <nav className="flex w-full items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-brand-700"
          >
            <ArrowRight className="size-4" />
            بازگشت به خانه
          </Link>
          <Badge
            variant="outline"
            className="gap-2 border-brand-200 bg-card/70 px-3 py-1 text-xs font-medium text-brand-700 backdrop-blur-sm"
          >
            <Smartphone className="size-3.5" />
            نسخهٔ اندروید
          </Badge>
        </nav>

        <div className="flex size-20 items-center justify-center rounded-3xl bg-gradient-to-br from-brand-500 to-accent-500 text-primary-foreground shadow-lg shadow-brand-500/20">
          <Download className="size-9" />
        </div>

        <h1 className="text-balance text-4xl font-extrabold leading-[1.25] text-foreground sm:text-5xl sm:leading-[1.2]">
          اپلیکیشن{" "}
          <span className="bg-gradient-to-l from-brand-600 to-accent-500 bg-clip-text text-transparent">
            همراه
          </span>{" "}
          رو مستقیم دانلود کن
        </h1>

        <p className="max-w-xl text-pretty text-lg leading-9 text-muted-foreground">
          فایل APK رسمی رو مستقیم از همین صفحه بگیر، نصب کن و همین حالا به
          هم‌سفرها بپیوند. بدون واسطه، بدون مراجعه به فروشگاه برنامه.
        </p>

        {/* Download metadata chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground">
          <span className="rounded-full bg-card/70 px-3 py-1 ring-1 ring-brand-100 backdrop-blur-sm">
            نسخهٔ {APP_VERSION}
          </span>
          <span className="rounded-full bg-card/70 px-3 py-1 ring-1 ring-brand-100 backdrop-blur-sm">
            حجم {formatAppSize()}
          </span>
          <span className="rounded-full bg-card/70 px-3 py-1 ring-1 ring-brand-100 backdrop-blur-sm">
            اندروید
          </span>
        </div>

        {/* Primary direct download */}
        <a
          href={APP_APK_HREF}
          download={APP_APK_FILENAME}
          className={cn(
            buttonVariants({ variant: "default" }),
            "h-14 w-full gap-2 rounded-full px-8 text-base font-semibold shadow-md shadow-brand-500/20 sm:w-auto",
          )}
        >
          <Download className="size-5" />
          دانلود مستقیم فایل APK
        </a>

        <p className="text-xs text-muted-foreground">
          اگر دانلود خودکار شروع نشد، روی لینک نگه‌دار و «ذخیرهٔ لینک» را انتخاب کن.
        </p>

        <Separator className="my-2 bg-brand-100" />

        {/* Install steps */}
        <div className="w-full">
          <h2 className="mb-6 text-2xl font-bold text-foreground">
            راهنمای نصب روی اندروید
          </h2>
          <ol className="mx-auto flex max-w-2xl flex-col gap-4 text-start">
            {installSteps.map((step, i) => (
              <li
                key={step.title}
                className="flex items-start gap-3 rounded-2xl bg-card/70 p-4 ring-1 ring-brand-100 backdrop-blur-sm"
              >
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-500 text-sm font-bold text-primary-foreground">
                  {toPersianDigits(i + 1)}
                </span>
                <div className="flex flex-col gap-1">
                  <span className="font-semibold text-foreground">
                    {step.title}
                  </span>
                  <span className="text-sm leading-7 text-muted-foreground">
                    {step.desc}
                  </span>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* Reassurance + iOS note */}
        <div className="grid w-full gap-3 text-start sm:grid-cols-2">
          <div className="flex items-start gap-3 rounded-2xl bg-brand-50/60 p-4 ring-1 ring-brand-100">
            <CheckCircle2 className="size-5 shrink-0 text-brand-600" />
            <p className="text-sm leading-7 text-muted-foreground">
              این فایل همان نسخهٔ رسمی و امضاشدهٔ همراه است که از طریق برنامهٔ
              اندروید ما هم توزیع می‌شود.
            </p>
          </div>
          <div className="flex items-start gap-3 rounded-2xl bg-muted/40 p-4 ring-1 ring-border">
            <Info className="size-5 shrink-0 text-muted-foreground" />
            <p className="text-sm leading-7 text-muted-foreground">
              فایل APK فقط روی اندروید نصب می‌شود. کاربران آیفون می‌توانند از
              <Link
                href="/"
                className="mx-1 font-medium text-brand-700 hover:underline"
              >
                نسخهٔ وب
              </Link>
              استفاده کنند.
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
