"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Loader2,
  ShieldCheck,
} from "lucide-react";

import { ApiError, type City, type Province, type User } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { errorMessage } from "@/lib/errors";
import { toLatinDigits } from "@/lib/format";
import { jalaliToISO } from "@/lib/jalali";
import { submitIdentity, type IdentityProfile } from "@/lib/identity";
import { listCities, listProvinces } from "@/lib/locations";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { OnboardingStepper } from "@/components/onboarding/onboarding-stepper";
import { BasicInfoStep } from "@/components/onboarding/steps/basic-info-step";
import { AddressStep } from "@/components/onboarding/steps/address-step";
import { DocumentsStep } from "@/components/onboarding/steps/documents-step";
import {
  EMPTY_FORM,
  type FieldErrors,
  type OnboardingForm,
} from "@/components/onboarding/types";
import {
  firstStepWithError,
  mapApiErrors,
  validateAddress,
  validateBasic,
  validateDocuments,
} from "@/components/onboarding/validation";

const STEPS = ["اطلاعات شما", "نشانی", "مدارک"];
const LAST_STEP = STEPS.length - 1;

export default function OnboardingFlow() {
  const router = useRouter();
  const { signIn } = useAuth();

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<OnboardingForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<FieldErrors>({});

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [provincesLoading, setProvincesLoading] = useState(true);
  const [cities, setCities] = useState<City[]>([]);
  const [citiesLoading, setCitiesLoading] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedUser, setSubmittedUser] = useState<User | null>(null);

  // Load the province list once.
  useEffect(() => {
    let active = true;
    listProvinces()
      .then((data) => active && setProvinces(data))
      .catch(() => active && setProvinces([]))
      .finally(() => active && setProvincesLoading(false));
    return () => {
      active = false;
    };
  }, []);

  // Reload cities whenever the chosen province changes; stale responses are
  // ignored via the `active` guard.
  useEffect(() => {
    if (!form.province_id) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCities([]);
      return;
    }
    let active = true;
    setCitiesLoading(true);
    listCities(Number(form.province_id))
      .then((data) => active && setCities(data))
      .catch(() => active && setCities([]))
      .finally(() => active && setCitiesLoading(false));
    return () => {
      active = false;
    };
  }, [form.province_id]);

  const update = useCallback((patch: Partial<OnboardingForm>) => {
    setForm((prev) => ({ ...prev, ...patch }));
    setErrors((prev) => {
      if (Object.keys(prev).length === 0) return prev;
      const next = { ...prev };
      for (const key of Object.keys(patch)) {
        // The birth pickers map to a single `birth_date` error key.
        if (key === "birth") delete next.birth_date;
        else delete next[key];
      }
      return next;
    });
  }, []);

  function handleNext() {
    const found = step === 0 ? validateBasic(form) : validateAddress(form);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }
    setErrors({});
    setStep((current) => Math.min(current + 1, LAST_STEP));
  }

  function handleBack() {
    setSubmitError(null);
    setErrors({});
    setStep((current) => Math.max(current - 1, 0));
  }

  async function handleSubmit() {
    if (submitting) return;

    // Re-validate the whole form so nothing slips through to the backend.
    const allErrors: FieldErrors = {
      ...validateBasic(form),
      ...validateAddress(form),
      ...validateDocuments(form),
    };
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      const target = firstStepWithError(allErrors);
      if (target !== null) setStep(target);
      return;
    }

    const token = getToken();
    if (!token) {
      setSubmitError("نشستت منقضی شده؛ برای ادامه دوباره وارد شو.");
      return;
    }

    setSubmitError(null);
    setErrors({});
    setSubmitting(true);
    try {
      const profile: IdentityProfile = {
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        national_code: toLatinDigits(form.national_code).replace(/\D/g, ""),
        birth_date: jalaliToISO(
          Number(form.birth.year),
          Number(form.birth.month),
          Number(form.birth.day),
        ),
        gender: form.gender as IdentityProfile["gender"],
        province_id: Number(form.province_id),
        city_id: Number(form.city_id),
        address: form.address.trim(),
      };
      const updated = await submitIdentity(token, profile, {
        national_card_image: form.national_card_image as File,
        face_image: form.face_image as File,
      });
      setSubmittedUser(updated);
    } catch (err) {
      if (err instanceof ApiError) {
        // Already submitted on a previous attempt — just move along.
        if (err.status === 409) {
          router.replace("/dashboard");
          return;
        }
        if (err.status === 422 && err.errors) {
          const mapped = mapApiErrors(err);
          setErrors(mapped);
          const target = firstStepWithError(mapped);
          if (target !== null) setStep(target);
          return;
        }
      }
      setSubmitError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  function handleContinue() {
    const token = getToken();
    // Push the now-"verifying" user into context before leaving, so the
    // dashboard guard sees the updated status instead of bouncing back here.
    if (token && submittedUser) signIn(token, submittedUser);
    router.replace("/dashboard");
  }

  if (submittedUser) {
    return (
      <div className="flex flex-col items-center gap-5 py-6 text-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-brand-50 text-brand-600">
          <BadgeCheck className="size-8" />
        </span>
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-foreground">
            اطلاعاتت ثبت شد
          </h1>
          <p className="mx-auto max-w-md text-pretty leading-8 text-muted-foreground">
            اطلاعات و مدارکت با موفقیت دریافت شد و در حال بررسیه. به‌محض تأیید
            هویت، با پیامک خبردارت می‌کنیم.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-brand-100 bg-brand-50/60 px-4 py-2.5 text-sm font-medium text-brand-700">
          <ShieldCheck className="size-4" />
          وضعیت: در حال بررسی
        </div>
        <Button
          onClick={handleContinue}
          className="h-12 w-full gap-2 rounded-xl text-base font-semibold"
        >
          رفتن به داشبورد
          <ArrowLeft className="size-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5 text-center">
        <h1 className="text-2xl font-bold text-foreground">تکمیل حساب</h1>
        <p className="text-sm leading-7 text-muted-foreground">
          برای استفاده از همراه، هویتت رو در سه گام ساده تأیید کن.
        </p>
      </div>

      <OnboardingStepper steps={STEPS} current={step} />

      {step === 0 ? (
        <BasicInfoStep form={form} errors={errors} update={update} />
      ) : step === 1 ? (
        <AddressStep
          form={form}
          errors={errors}
          update={update}
          provinces={provinces}
          cities={cities}
          provincesLoading={provincesLoading}
          citiesLoading={citiesLoading}
        />
      ) : (
        <DocumentsStep form={form} errors={errors} update={update} />
      )}

      {submitError ? (
        <p className="text-center text-sm text-destructive" role="alert">
          {submitError}
        </p>
      ) : null}

      <div className="flex items-center gap-3">
        {step > 0 ? (
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={submitting}
            className="h-12 gap-1.5 rounded-xl px-5 text-base"
          >
            <ArrowRight className="size-4" />
            قبلی
          </Button>
        ) : null}

        {step < LAST_STEP ? (
          <Button
            type="button"
            onClick={handleNext}
            className="h-12 flex-1 gap-1.5 rounded-xl text-base font-semibold"
          >
            بعدی
            <ArrowLeft className="size-4" />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="h-12 flex-1 gap-2 rounded-xl text-base font-semibold"
          >
            {submitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                در حال ارسال…
              </>
            ) : (
              <>
                <ShieldCheck className="size-4" />
                ثبت و تأیید هویت
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
