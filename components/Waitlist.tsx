"use client";

import { useState } from "react";
import { Send, BadgeCheck } from "lucide-react";

import Section from "@/components/ui/Section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Waitlist() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!EMAIL_RE.test(email)) {
      setError("به نظر ایمیلت درست نیست؛ یه نگاه دیگه بنداز.");
      return;
    }
    // No backend yet — this simply confirms the address locally.
    setError(null);
    setSubmitted(true);
  }

  return (
    <Section id="waitlist">
      <div className="relative mx-auto max-w-3xl overflow-hidden rounded-[2rem] border border-brand-100 bg-gradient-to-bl from-brand-50 to-background px-6 py-14 text-center sm:px-12">
        <h2 className="text-pretty text-3xl font-bold text-foreground sm:text-4xl">
          از روز اول با ما باش
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-pretty text-lg leading-8 text-muted-foreground">
          ایمیلت رو بذار تا روز شروعِ همراه، قبل از همه خبردار بشی.
        </p>

        {submitted ? (
          <div className="mx-auto mt-8 flex max-w-md items-center justify-center gap-2 rounded-2xl border border-brand-200 bg-card px-5 py-4 text-brand-700">
            <BadgeCheck className="size-5" />
            <span className="font-medium">ثبت شد! خبرای خوب تو راهه.</span>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            noValidate
            className="mx-auto mt-8 flex max-w-md flex-col gap-3"
          >
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input
                type="email"
                inputMode="email"
                dir="ltr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                aria-label="نشانی ایمیل"
                aria-invalid={Boolean(error)}
                className="h-12 flex-1 rounded-full bg-card px-5 text-start"
              />
              <Button
                type="submit"
                className="h-12 gap-2 rounded-full px-7 text-base font-semibold"
              >
                <Send className="size-4" />
                خبرم کن
              </Button>
            </div>
            {error ? (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                نه هزینه‌ای در کاره، نه اسپمی؛ هر وقت هم بخوای می‌تونی انصراف
                بدی.
              </p>
            )}
          </form>
        )}
      </div>
    </Section>
  );
}
