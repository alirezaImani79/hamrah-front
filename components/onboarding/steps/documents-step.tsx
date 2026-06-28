"use client";

import { ShieldCheck } from "lucide-react";

import { ImageUpload } from "@/components/onboarding/image-upload";
import type { FieldErrors, OnboardingForm } from "@/components/onboarding/types";

type Props = {
  form: OnboardingForm;
  errors: FieldErrors;
  update: (patch: Partial<OnboardingForm>) => void;
};

export function DocumentsStep({ form, errors, update }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-2 rounded-xl border border-brand-100 bg-brand-50/50 px-4 py-3 text-sm leading-7 text-brand-800">
        <ShieldCheck className="mt-1 size-4 shrink-0" />
        <p>
          تصویرها فقط برای احراز هویت استفاده می‌شن. مطمئن شو نوشته‌های کارت ملی
          واضح و خوانا باشن.
        </p>
      </div>

      <ImageUpload
        id="national_card_image"
        label="تصویر کارت ملی"
        hint="کل کارت داخل کادر و خوانا باشه"
        value={form.national_card_image}
        onChange={(file) => update({ national_card_image: file })}
        error={errors.national_card_image}
        capture="environment"
      />

      <ImageUpload
        id="face_image"
        label="عکس سلفی"
        hint="رو‌به‌رو، با نور کافی و بدون عینک آفتابی"
        value={form.face_image}
        onChange={(file) => update({ face_image: file })}
        error={errors.face_image}
        capture="user"
      />
    </div>
  );
}
