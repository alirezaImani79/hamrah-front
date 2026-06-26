import { ArrowLeft, Sprout } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import AuthNavButton from "@/components/AuthNavButton";
import CountdownTimer from "@/components/CountdownTimer";

const navLinks = [
  { href: "#how", label: "چطوری کار می‌کنه" },
  { href: "#ai", label: "هوش مصنوعی" },
  { href: "#impact", label: "اثر اجتماعی" },
];

export default function Hero() {
  return (
    <header
      id="hero"
      className="relative isolate overflow-hidden bg-gradient-to-b from-brand-50 via-background to-background"
    >
      {/* Soft floating color glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 start-1/2 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-brand-300/40 blur-3xl animate-float-slow"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-40 end-0 -z-10 h-64 w-64 rounded-full bg-accent-300/30 blur-3xl animate-float-slow"
      />

      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-6 sm:px-8">
        <div className="flex items-center gap-2 text-2xl font-extrabold text-brand-700">
          <Sprout className="size-7" />
          همراه
        </div>
        <div className="hidden items-center gap-7 text-sm font-medium text-muted-foreground sm:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-brand-700"
            >
              {link.label}
            </a>
          ))}
          <AuthNavButton />
        </div>
      </nav>

      <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-7 px-5 pb-24 pt-12 text-center sm:px-8 sm:pt-20">
        <Badge
          variant="outline"
          className="gap-2 border-brand-200 bg-card/70 px-4 py-1.5 text-sm font-medium text-brand-700 backdrop-blur-sm"
        >
          <span className="size-2 rounded-full bg-brand-500" />
          سفر هوشمند، شهرِ پاک‌تر
        </Badge>

        <h1 className="text-balance text-4xl font-extrabold leading-[1.25] text-foreground sm:text-5xl sm:leading-[1.2]">
         با همراه؛ هر صندلی خالی{" "}
          
        </h1>
        <h1 className="text-balance text-4xl font-extrabold leading-[1.25] text-foreground sm:text-5xl sm:leading-[1.2]">
          <span className="bg-gradient-to-l from-brand-600 to-accent-500 bg-clip-text text-transparent">
            یه فرصت طلاییه
          </span>
        </h1>

        <p className="max-w-xl text-pretty text-lg leading-9 text-muted-foreground">
          همراه یه پلتفرم هم‌سفریه که با هوش مصنوعی آدم‌های هم‌مسیر رو پیدا
          می‌کنه و کنار هم می‌ذاره؛ صندلی‌ها پر می‌شن، بنزین کمتری می‌سوزه و
          خیابون یه نفسی می‌کشه.
        </p>

        {/* Countdown */}
        <div className="mt-2 flex w-full flex-col items-center gap-4 rounded-3xl border border-brand-100 bg-card/50 p-6 backdrop-blur-sm sm:p-8">
          <p className="text-sm font-medium text-muted-foreground">
            تا شروع همراه این‌قدر مونده:
          </p>
          <CountdownTimer />
        </div>

        <div className="mt-2 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <a
            href="#waitlist"
            className={cn(
              buttonVariants({ variant: "default" }),
              "h-12 rounded-full px-7 text-base font-semibold shadow-lg shadow-brand-600/25"
            )}
          >
            جزو اولین‌ها باش
          </a>
          <a
            href="#how"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "h-12 gap-1 rounded-full border-brand-200 bg-card/70 px-7 text-base font-semibold text-brand-700 backdrop-blur-sm"
            )}
          >
            ببین چطوری کار می‌کنه
            <ArrowLeft className="size-4" />
          </a>
        </div>
      </div>
    </header>
  );
}
