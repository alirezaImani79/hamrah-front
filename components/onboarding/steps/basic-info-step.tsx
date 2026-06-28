"use client";

import { Mars, Venus } from "lucide-react";

import type { Gender } from "@/lib/api";
import { cn } from "@/lib/utils";
import { toLatinDigits, toPersianDigits } from "@/lib/format";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/onboarding/field";
import { JalaliDateField } from "@/components/onboarding/jalali-date-field";
import type { FieldErrors, OnboardingForm } from "@/components/onboarding/types";

type Props = {
  form: OnboardingForm;
  errors: FieldErrors;
  update: (patch: Partial<OnboardingForm>) => void;
};

const GENDERS: { value: Gender; label: string; icon: typeof Mars }[] = [
  { value: "male", label: "مرد", icon: Mars },
  { value: "female", label: "زن", icon: Venus },
];

export function BasicInfoStep({ form, errors, update }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="نام" htmlFor="first_name" error={errors.first_name}>
          <Input
            id="first_name"
            value={form.first_name}
            onChange={(e) => update({ first_name: e.target.value })}
            placeholder="مثلاً علی"
            autoComplete="given-name"
            aria-invalid={Boolean(errors.first_name)}
            className="h-11 rounded-xl bg-card px-3.5 text-base"
          />
        </Field>

        <Field label="نام خانوادگی" htmlFor="last_name" error={errors.last_name}>
          <Input
            id="last_name"
            value={form.last_name}
            onChange={(e) => update({ last_name: e.target.value })}
            placeholder="مثلاً ایمانی"
            autoComplete="family-name"
            aria-invalid={Boolean(errors.last_name)}
            className="h-11 rounded-xl bg-card px-3.5 text-base"
          />
        </Field>
      </div>

      <Field label="کد ملی" htmlFor="national_code" error={errors.national_code}>
        <Input
          id="national_code"
          dir="ltr"
          inputMode="numeric"
          maxLength={10}
          value={toPersianDigits(form.national_code)}
          onChange={(e) =>
            update({
              national_code: toLatinDigits(e.target.value)
                .replace(/\D/g, "")
                .slice(0, 10),
            })
          }
          placeholder="۰۰۱۲۳۴۵۶۷۸"
          aria-invalid={Boolean(errors.national_code)}
          className="h-11 rounded-xl bg-card px-3.5 text-center text-base tracking-widest"
        />
      </Field>

      <Field label="جنسیت" error={errors.gender} required>
        <div className="grid grid-cols-2 gap-2">
          {GENDERS.map(({ value, label, icon: Icon }) => {
            const selected = form.gender === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => update({ gender: value })}
                aria-pressed={selected}
                className={cn(
                  "flex h-11 items-center justify-center gap-2 rounded-xl border text-base font-medium transition-colors",
                  selected
                    ? "border-brand-500 bg-brand-50 text-brand-800"
                    : "border-input bg-card text-muted-foreground hover:border-brand-300 hover:text-foreground",
                )}
              >
                <Icon className="size-4" />
                {label}
              </button>
            );
          })}
        </div>
      </Field>

      <Field label="تاریخ تولد" error={errors.birth_date} required>
        <JalaliDateField
          value={form.birth}
          onChange={(birth) => update({ birth })}
          invalid={Boolean(errors.birth_date)}
        />
      </Field>
    </div>
  );
}
