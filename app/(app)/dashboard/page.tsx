import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Car, MapPin, Sparkles, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import IdentityStatusBanner from "@/components/dashboard/identity-status-banner";

export const metadata: Metadata = {
  title: "داشبورد | همراه",
  description: "داشبورد کاربری همراه.",
};

type Placeholder = {
  icon: LucideIcon;
  title: string;
  desc: string;
  /** When set, the card links to this href and shows as live instead of "به‌زودی". */
  href?: string;
};

const placeholders: Placeholder[] = [
  {
    icon: Car,
    title: "سفرهای من",
    desc: "سفرهای فعال و گذشته‌ات این‌جا نمایش داده می‌شن.",
  },
  {
    icon: MapPin,
    title: "مسیرهای پرتکرار",
    desc: "مسیرهای همیشگی‌ات رو ذخیره کن تا سریع‌تر هم‌سفر پیدا کنی.",
  },
  {
    icon: Users,
    title: "هم‌سفرها",
    desc: "آدم‌های هم‌مسیرت رو ببین و باهاشون هماهنگ شو.",
  },
  {
    icon: Sparkles,
    title: "پیشنهاد هوشمند",
    desc: "ترجیحاتت رو مشخص کن تا سفرهای هم‌مسیر رو بهت پیشنهاد بدیم.",
    href: "/dashboard/find-trip",
  },
];

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <IdentityStatusBanner />

      <section className="rounded-3xl border border-brand-100 bg-gradient-to-bl from-brand-50 to-card p-7 sm:p-9">
        <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-card/70 px-3 py-1 text-xs font-medium text-brand-700">
          <span className="size-1.5 rounded-full bg-brand-500" />
          نسخه آزمایشی
        </span>
        <h1 className="mt-4 text-2xl font-bold text-foreground sm:text-3xl">
          به داشبورد همراه خوش اومدی 👋
        </h1>
        <p className="mt-2 max-w-xl text-pretty leading-8 text-muted-foreground">
          این‌جا داشبورد توئه. هنوز در حال ساختنشیم؛ به‌زودی همه‌چیزی که برای
          شروع هم‌سفری لازم داری این‌جا در دسترست خواهد بود.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        {placeholders.map(({ icon: Icon, title, desc, href }) => {
          const card = (
            <Card
              className={cn(
                "gap-3 p-6 transition-colors",
                href &&
                  "group hover:border-brand-200 hover:bg-brand-50/40",
              )}
            >
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <Icon className="size-5" />
                </span>
                <h2 className="font-heading text-base font-semibold text-foreground">
                  {title}
                </h2>
                {href ? (
                  <span className="ms-auto inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">
                    فعال
                    <ArrowLeft className="size-3 transition-transform group-hover:-translate-x-0.5" />
                  </span>
                ) : (
                  <span className="ms-auto rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                    به‌زودی
                  </span>
                )}
              </div>
              <p className="text-sm leading-7 text-muted-foreground">{desc}</p>
            </Card>
          );

          return href ? (
            <Link key={title} href={href}>
              {card}
            </Link>
          ) : (
            <div key={title}>{card}</div>
          );
        })}
      </section>
    </div>
  );
}
