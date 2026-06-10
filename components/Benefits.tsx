import { Fuel, Wind, Route, HeartHandshake } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import Section from "@/components/ui/Section";

const IMPACTS: { title: string; body: string; icon: LucideIcon }[] = [
  {
    title: "صرفه‌جویی در سوخت",
    body: "هر صندلی که پر می‌شه یعنی یه ماشین کمتر توی خیابون و یه قدم به نفع تراز انرژی کشور.",
    icon: Fuel,
  },
  {
    title: "هوای پاک‌تر، خیابون خلوت‌تر",
    body: "ماشین تک‌سرنشین که کم بشه، ترافیک سبک‌تر می‌شه و آسمون شهر صاف‌تر.",
    icon: Wind,
  },
  {
    title: "جابه‌جایی برای همه",
    body: "اونایی هم که ماشین ندارن، راحت‌تر و کم‌هزینه‌تر به مقصد می‌رسن.",
    icon: Route,
  },
  {
    title: "همدلی اجتماعی",
    body: "فرهنگ سهیم‌شدن و استفاده‌ی درست از منابع، از همین سفرهای کوچیک شروع می‌شه.",
    icon: HeartHandshake,
  },
];

export default function Benefits() {
  return (
    <Section id="impact">
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-bl from-brand-800 via-brand-700 to-brand-900 px-6 py-16 text-white sm:px-12">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-16 end-[-3rem] h-64 w-64 rounded-full bg-brand-400/20 blur-3xl"
        />
        <div className="relative mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center rounded-full bg-white/15 px-4 py-1 text-sm font-medium text-brand-50">
            یه قدم کوچیک، یه اثر بزرگ
          </span>
          <h2 className="mt-4 text-pretty text-3xl font-bold leading-tight sm:text-4xl">
            وقتی مسیرها یکی می‌شن، شهر نفس می‌کشه
          </h2>
          <p className="mt-3 text-pretty text-lg leading-8 text-brand-50/80">
            نه جاده‌ی جدید می‌خواد نه زیرساخت تازه؛ فقط کافیه از ماشین‌هایی که
            همین الان توی خیابونن، هوشمندانه‌تر استفاده کنیم.
          </p>
        </div>

        <div className="relative mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {IMPACTS.map(({ title, body, icon: Icon }) => (
            <div
              key={title}
              className="flex flex-col gap-3 rounded-2xl border border-white/15 bg-white/10 p-6 backdrop-blur-sm"
            >
              <span className="flex size-11 items-center justify-center rounded-2xl bg-white/15 text-brand-50">
                <Icon className="size-5" />
              </span>
              <h3 className="text-lg font-bold">{title}</h3>
              <p className="text-pretty leading-7 text-brand-50/80">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
