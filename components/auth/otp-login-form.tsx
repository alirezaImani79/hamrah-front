"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Loader2, MessageSquareLock, Send } from "lucide-react";

import { requestOtp, verifyOtp } from "@/lib/auth";
import { needsIdentityOnboarding } from "@/lib/identity";
import { errorMessage } from "@/lib/errors";
import { toLatinDigits, toPersianDigits } from "@/lib/format";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP } from "@/components/ui/input-otp";

type Step = "phone" | "code";

const OTP_LENGTH = 6;
/** Iranian mobile number: 11 digits, starts with `09`. */
const IRAN_MOBILE_RE = /^09\d{9}$/;

export default function OtpLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn } = useAuth();

  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const nextPath = searchParams.get("next") ?? "/dashboard";

  async function handleRequest(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    if (!phone) {
      setError("شماره موبایلت رو وارد کن.");
      return;
    }
    if (!IRAN_MOBILE_RE.test(phone)) {
      setError("شماره موبایل معتبر نیست؛ باید با ۰۹ شروع بشه و ۱۱ رقم باشه.");
      return;
    }
    setError(null);
    setNotice(null);
    setLoading(true);
    try {
      await requestOtp(phone);
      setCode("");
      setStep("code");
    } catch (err) {
      setError(errorMessage(err, "phone_number"));
    } finally {
      setLoading(false);
    }
  }

  async function verify(value: string) {
    if (loading) return;
    if (value.length < OTP_LENGTH) {
      setError("کد تأیید رو کامل وارد کن.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const auth = await verifyOtp(phone, value);
      signIn(auth.token, auth.user);
      // New users — and anyone who never finished identity onboarding — go
      // complete it before reaching their requested destination.
      const target =
        auth.is_new_user || needsIdentityOnboarding(auth.user)
          ? "/onboarding"
          : nextPath;
      router.replace(target);
    } catch (err) {
      setError(errorMessage(err, "code"));
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (loading) return;
    setError(null);
    setNotice(null);
    setLoading(true);
    try {
      await requestOtp(phone);
      setCode("");
      setNotice("کد جدید برات ارسال شد.");
    } catch (err) {
      setError(errorMessage(err, "phone_number"));
    } finally {
      setLoading(false);
    }
  }

  function handleEditPhone() {
    setStep("phone");
    setError(null);
    setNotice(null);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
          <MessageSquareLock className="size-6" />
        </span>
        <h1 className="text-2xl font-bold text-foreground">ورود به همراه</h1>
        <p className="text-sm leading-7 text-muted-foreground">
          {step === "phone" ? (
            "شماره موبایلت رو وارد کن تا کد ورود برات بفرستیم."
          ) : (
            <>
              کد تأیید رو به شماره{" "}
              <span dir="ltr" className="font-medium text-foreground">
                {toPersianDigits(phone)}
              </span>{" "}
              فرستادیم.
            </>
          )}
        </p>
      </div>

      {step === "phone" ? (
        <form onSubmit={handleRequest} noValidate className="flex flex-col gap-3">
          <Input
            type="tel"
            inputMode="numeric"
            dir="ltr"
            autoComplete="tel"
            autoFocus
            maxLength={11}
            value={toPersianDigits(phone)}
            onChange={(e) => {
              setPhone(toLatinDigits(e.target.value).replace(/\D/g, "").slice(0, 11));
              if (error) setError(null);
            }}
            placeholder="۰۹۱۲۳۴۵۶۷۸۹"
            aria-label="شماره موبایل"
            aria-invalid={Boolean(error)}
            className="h-12 rounded-xl bg-card px-4 text-center text-base tracking-widest"
          />
          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
          <Button
            type="submit"
            disabled={loading}
            className="h-12 gap-2 rounded-xl text-base font-semibold"
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
            ارسال کد
          </Button>
        </form>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            verify(code);
          }}
          noValidate
          className="flex flex-col gap-4"
        >
          <InputOTP
            value={code}
            onChange={(v) => {
              setCode(v);
              if (error) setError(null);
              if (notice) setNotice(null);
            }}
            onComplete={(v) => verify(v)}
            length={OTP_LENGTH}
            disabled={loading}
            autoFocus
            invalid={Boolean(error)}
            aria-label="کد تأیید"
          />
          {error ? (
            <p className="text-center text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : notice ? (
            <p className="text-center text-sm text-brand-700">{notice}</p>
          ) : null}
          <Button
            type="submit"
            disabled={loading}
            className="h-12 gap-2 rounded-xl text-base font-semibold"
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : null}
            تأیید و ورود
          </Button>
          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={handleEditPhone}
              className="inline-flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowRight className="size-4" />
              ویرایش شماره
            </button>
            <button
              type="button"
              onClick={handleResend}
              disabled={loading}
              className="font-medium text-brand-700 transition-colors hover:text-brand-800 disabled:opacity-50"
            >
              ارسال دوباره کد
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
