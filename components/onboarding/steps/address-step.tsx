"use client";

import * as React from "react";

import type { City, Province } from "@/lib/api";
import { Textarea } from "@/components/ui/textarea";
import { Select, type SelectOption } from "@/components/ui/select";
import { Field } from "@/components/onboarding/field";
import { InlineSpinner } from "@/components/onboarding/image-upload";
import type { FieldErrors, OnboardingForm } from "@/components/onboarding/types";

type Props = {
  form: OnboardingForm;
  errors: FieldErrors;
  update: (patch: Partial<OnboardingForm>) => void;
  provinces: Province[];
  cities: City[];
  provincesLoading: boolean;
  citiesLoading: boolean;
};

export function AddressStep({
  form,
  errors,
  update,
  provinces,
  cities,
  provincesLoading,
  citiesLoading,
}: Props) {
  const provinceOptions = React.useMemo<SelectOption[]>(
    () => provinces.map((p) => ({ value: String(p.id), label: p.name })),
    [provinces],
  );
  const cityOptions = React.useMemo<SelectOption[]>(
    () => cities.map((c) => ({ value: String(c.id), label: c.name })),
    [cities],
  );

  return (
    <div className="flex flex-col gap-4">
      <Field
        label="استان"
        error={errors.province_id}
        hint={provincesLoading ? <InlineSpinner label="در حال بارگذاری…" /> : undefined}
      >
        <Select
          items={provinceOptions}
          value={form.province_id}
          // Changing province resets the chosen city.
          onValueChange={(province_id) =>
            update({ province_id, city_id: null })
          }
          placeholder="استانت رو انتخاب کن"
          aria-label="استان"
          disabled={provincesLoading || provinceOptions.length === 0}
          invalid={Boolean(errors.province_id)}
        />
      </Field>

      <Field
        label="شهر"
        error={errors.city_id}
        hint={citiesLoading ? <InlineSpinner label="در حال بارگذاری…" /> : undefined}
      >
        <Select
          items={cityOptions}
          value={form.city_id}
          onValueChange={(city_id) => update({ city_id })}
          placeholder={
            form.province_id ? "شهرت رو انتخاب کن" : "اول استان رو انتخاب کن"
          }
          aria-label="شهر"
          disabled={!form.province_id || citiesLoading}
          invalid={Boolean(errors.city_id)}
        />
      </Field>

      <Field
        label="نشانی"
        htmlFor="address"
        error={errors.address}
        hint="خیابان، کوچه، پلاک و کد پستی"
      >
        <Textarea
          id="address"
          value={form.address}
          onChange={(e) => update({ address: e.target.value })}
          placeholder="مثلاً تهران، خیابان ولیعصر، کوچه ۵، پلاک ۱۲"
          aria-invalid={Boolean(errors.address)}
        />
      </Field>
    </div>
  );
}
