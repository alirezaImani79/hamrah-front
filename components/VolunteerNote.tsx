import { HeartHandshake } from "lucide-react";

import Section from "@/components/ui/Section";

export default function VolunteerNote() {
  return (
    <Section id="mission">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 rounded-[2rem] border border-brand-100 bg-brand-50/70 px-6 py-12 text-center sm:px-12">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-brand-600 text-primary-foreground">
          <HeartHandshake className="size-7" />
        </span>
        <h2 className="text-pretty text-2xl font-bold text-foreground sm:text-3xl">
          یه حرکت داوطلبانه، نه یه کاسبی
        </h2>
        <p className="text-pretty text-lg leading-8 text-muted-foreground">
          همراه توی فاز اول، برعکس سرویس‌های تجاری حمل‌ونقل، کاملاً داوطلبانه و
          غیرانتفاعیه. نه کرایه‌ای در کاره نه کمیسیونی؛ فقط همدلی و یه شهر بهتر
          برای همه.
        </p>
      </div>
    </Section>
  );
}
