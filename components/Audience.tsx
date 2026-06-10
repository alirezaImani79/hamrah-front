import {
  GraduationCap,
  Briefcase,
  UserRound,
  Clock,
  Route,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import { Card, CardContent } from "@/components/ui/card";

const AUDIENCE: { title: string; body: string; icon: LucideIcon }[] = [
  {
    title: "دانشجوها و دانش‌آموزها",
    body: "رفت‌وآمد هر روز به دانشگاه و مدرسه، راحت‌تر و کم‌خرج‌تر.",
    icon: GraduationCap,
  },
  {
    title: "کارمندها و تیم‌ها",
    body: "مسیر ثابت محل کار رو با همکارها و هم‌مسیرها قسمت کن.",
    icon: Briefcase,
  },
  {
    title: "اونایی که ماشین ندارن",
    body: "بدون ماشین هم می‌تونی همراهِ یه سفر برنامه‌ریزی‌شده بشی.",
    icon: UserRound,
  },
  {
    title: "وقتی ماشینت در دسترس نیست",
    body: "ماشینت تعمیرگاهه؟ مسیر همیشگی‌ت سر جاشه.",
    icon: Clock,
  },
  {
    title: "هم‌مسیرهای هر روزه",
    body: "هر کی مسیر تکراریِ مشابهی داره، یه هم‌سفر بالقوه‌ست.",
    icon: Route,
  },
];

export default function Audience() {
  return (
    <Section id="audience">
      <SectionHeading
        eyebrow="همراه برای کیه؟"
        title="برای همه‌ی آدم‌های توی راه"
        subtitle="اگه مسیرت هر روز تکرار می‌شه، همراه دقیقاً برای تو ساخته شده."
      />
      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {AUDIENCE.map(({ title, body, icon: Icon }) => (
          <Card key={title} className="py-6">
            <CardContent className="flex items-start gap-4">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-brand-100 text-brand-700">
                <Icon className="size-5" />
              </span>
              <div className="flex flex-col gap-1.5">
                <h3 className="font-bold text-foreground">{title}</h3>
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
