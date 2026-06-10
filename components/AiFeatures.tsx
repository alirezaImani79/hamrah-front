import { Network, Sparkles, MessagesSquare, ChartLine } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import { Card, CardContent } from "@/components/ui/card";

const FEATURES: { title: string; body: string; icon: LucideIcon }[] = [
  {
    title: "تطبیق هوشمند راننده و مسافر",
    body: "سفرهای سازگار از نظر مسیر و زمان، همون لحظه به هم وصل می‌شن؛ بدون دور زدن الکی.",
    icon: Network,
  },
  {
    title: "پیشنهاد بهترین هم‌سفر",
    body: "بر اساس سلیقه و عادت‌های رفت‌وآمدت، بهترین همراه‌ها معرفی می‌شن؛ نه فقط نزدیک‌ترین‌ها.",
    icon: Sparkles,
  },
  {
    title: "دستیار همیشه‌آنلاین",
    body: "یه دستیار چت‌محور مبتنی بر مدل‌های زبانی، قدم‌به‌قدم توی ثبت سفر و پیدا کردن هم‌سفر کنارته.",
    icon: MessagesSquare,
  },
  {
    title: "تحلیل الگوی سفرها",
    body: "همراه عادت‌های جابه‌جاییت رو یاد می‌گیره و پیشنهادهاش هر روز دقیق‌تر می‌شن.",
    icon: ChartLine,
  },
];

export default function AiFeatures() {
  return (
    <Section id="ai" className="bg-gradient-to-b from-background to-brand-50/60">
      <SectionHeading
        eyebrow="مغز متفکر ماجرا"
        title="هوش مصنوعی در قلب همراه"
        subtitle="یادگیری ماشین و مدل‌های زبانی کاری می‌کنن که پیدا کردن هم‌سفر دیگه جست‌وجو نباشه؛ یه پیشنهاد دقیق و شخصی باشه."
      />
      <div className="mt-14 grid gap-6 sm:grid-cols-2">
        {FEATURES.map(({ title, body, icon: Icon }) => (
          <Card key={title} className="py-7">
            <CardContent className="flex gap-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-accent-500/10 text-accent-600">
                <Icon className="size-6" />
              </span>
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-bold text-foreground">{title}</h3>
                <p className="text-pretty leading-7 text-muted-foreground">
                  {body}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </Section>
  );
}
