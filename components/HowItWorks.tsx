import { ClipboardList, Search, Sparkles, CarFront } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const STEPS: {
  num: string;
  title: string;
  body: string;
  icon: LucideIcon;
}[] = [
  {
    num: "۱",
    title: "سفرت رو ثبت کن",
    body: "مبدأ، مقصد، ساعت حرکت، تعداد صندلی خالی و ترجیح‌هات (مثل جنسیت هم‌سفر) رو وارد کن؛ نیم دقیقه هم طول نمی‌کشه.",
    icon: ClipboardList,
  },
  {
    num: "۲",
    title: "هم‌مسیرهات رو ببین",
    body: "کسایی که مسیرشون بهت می‌خوره سفرت رو می‌بینن و درخواست همراهی می‌فرستن.",
    icon: Search,
  },
  {
    num: "۳",
    title: "بذار هوش مصنوعی انتخاب کنه",
    body: "بهترین گزینه‌ها بر اساس مسیر، زمان و سلیقه‌ت رتبه‌بندی می‌شن تا راحت انتخاب کنی.",
    icon: Sparkles,
  },
  {
    num: "۴",
    title: "هماهنگ کن و بزن بریم",
    body: "وقتی دو طرف اوکی دادن، جزئیات نهایی می‌شه و سفر مشترک استارت می‌خوره.",
    icon: CarFront,
  },
];

export default function HowItWorks() {
  return (
    <Section id="how">
      <SectionHeading
        eyebrow="خیلی ساده‌ست"
        title="چطوری کار می‌کنه؟"
        subtitle="از ثبت سفر تا حرکت، فقط چهار قدمه."
      />
      <ol className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map(({ num, title, body, icon: Icon }) => (
          <li key={num}>
            <Card className="h-full gap-4 py-6 transition-shadow hover:shadow-md">
              <CardHeader className="gap-4">
                <div className="flex items-center justify-between">
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                    <Icon className="size-5" />
                  </span>
                  <span className="text-3xl font-extrabold text-brand-100">
                    {num}
                  </span>
                </div>
                <CardTitle className="text-lg font-bold">{title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-pretty leading-7 text-muted-foreground">
                  {body}
                </p>
              </CardContent>
            </Card>
          </li>
        ))}
      </ol>
    </Section>
  );
}
