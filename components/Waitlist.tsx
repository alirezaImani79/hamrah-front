"use client";

import { useState } from "react";
import { ArrowRight, BadgeCheck, BellRing, Loader2, Send } from "lucide-react";

import { requestOtp, verifyOtp, subscribeNewsletter, getToken } from "@/lib/auth";
import { errorMessage } from "@/lib/errors";
import { toLatinDigits, toPersianDigits } from "@/lib/format";
import { useAuth } from "@/components/auth/auth-provider";
import Section from "@/components/ui/Section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP } from "@/components/ui/input-otp";

type Step = "phone" | "code";

const OTP_LENGTH = 6;
/** Iranian mobile number: 11 digits, starts with `09`. */
const IRAN_MOBILE_RE = /^09\d{9}$/;

// The SMS newsletter is auth-gated on the backend (it subscribes the
// authenticated user). So joining = verifying a phone via OTP — which also
// signs the user in — and then subscribing. Already-signed-in visitors skip
// straight to a one-tap subscribe.
export default function Waitlist() {
  const { status, user, signIn } = useAuth();

  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [justSubscribed, setJustSubscribed] = useState(false);

  const subscribed = justSubscribed || (user?.is_subscribed_to_newsletter ?? false);

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
      // Verifying the OTP signs the user in; then subscribe them. We persist the
      // updated (subscribed) user so the rest of the app reflects it immediately.
      const auth = await verifyOtp(phone, value);
      const updated = await subscribeNewsletter(auth.token);
      signIn(auth.token, updated);
      setJustSubscribed(true);
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

  async function handleSubscribeAuthed() {
    if (loading) return;
    const token = getToken();
    if (!token) {
      setError("نشستت منقضی شده؛ برای ادامه دوباره وارد شو.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const updated = await subscribeNewsletter(token);
      signIn(token, updated);
      setJustSubscribed(true);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Section id="waitlist">
      <div className="relative mx-auto max-w-3xl overflow-hidden rounded-[2rem] border border-brand-100 bg-gradient-to-bl from-brand-50 to-background px-6 py-14 text-center sm:px-12">
        <h2 className="text-pretty text-3xl font-bold text-foreground sm:text-4xl">
          از روز اول با ما باش
        </h2>

        {subscribed ? (
          <>
            <p className="mx-auto mt-3 max-w-xl text-pretty text-lg leading-8 text-muted-foreground">
              عضو خبرنامه پیامکی همراه شدی.
            </p>
            <div className="mx-auto mt-8 flex max-w-md items-center justify-center gap-2 rounded-2xl border border-brand-200 bg-card px-5 py-4 text-brand-700">
              <BadgeCheck className="size-5" />
              <span className="font-medium">
                روز شروع همراه، اولین پیامک رو از ما می‌گیری.
              </span>
            </div>
          </>
        ) : status === "authenticated" ? (
          <>
            <p className="mx-auto mt-3 max-w-xl text-pretty text-lg leading-8 text-muted-foreground">
              تو حساب همراه واردی؛ فقط کافیه عضو خبرنامه پیامکی بشی تا روز شروع
              خبردارت کنیم.
            </p>
            <div className="mx-auto mt-8 flex max-w-md flex-col gap-3">
              <Button
                onClick={handleSubscribeAuthed}
                disabled={loading}
                className="h-12 gap-2 rounded-full px-7 text-base font-semibold"
              >
                {loading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <BellRing className="size-4" />
                )}
                عضو خبرنامه شو
              </Button>
              {error ? (
                <p className="text-sm text-destructive" role="alert">
                  {error}
                </p>
              ) : null}
            </div>
          </>
        ) : step === "phone" ? (
          <>
            <p className="mx-auto mt-3 max-w-xl text-pretty text-lg leading-8 text-muted-foreground">
              شماره موبایلت رو بذار تا روز شروعِ همراه، با پیامک قبل از همه خبردار
              بشی.
            </p>
            <form
              onSubmit={handleRequest}
              noValidate
              className="mx-auto mt-8 flex max-w-md flex-col gap-3"
            >
              <div className="flex flex-col gap-3 sm:flex-row">
                <Input
                  type="tel"
                  inputMode="numeric"
                  dir="ltr"
                  autoComplete="tel"
                  maxLength={11}
                  value={toPersianDigits(phone)}
                  onChange={(e) => {
                    setPhone(
                      toLatinDigits(e.target.value).replace(/\D/g, "").slice(0, 11)
                    );
                    if (error) setError(null);
                  }}
                  placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                  aria-label="شماره موبایل"
                  aria-invalid={Boolean(error)}
                  className="h-12 flex-1 rounded-full bg-card px-5 text-center tracking-widest"
                />
                <Button
                  type="submit"
                  disabled={loading}
                  className="h-12 gap-2 rounded-full px-7 text-base font-semibold"
                >
                  {loading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Send className="size-4" />
                  )}
                  ارسال کد
                </Button>
              </div>
              {error ? (
                <p className="text-sm text-destructive" role="alert">
                  {error}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  نه هزینه‌ای در کاره، نه اسپمی؛ هر وقت بخوای می‌تونی لغو کنی.
                </p>
              )}
            </form>
          </>
        ) : (
          <>
            <p className="mx-auto mt-3 max-w-xl text-pretty text-lg leading-8 text-muted-foreground">
              کد تأیید رو به شماره{" "}
              <span dir="ltr" className="font-medium text-foreground">
                {toPersianDigits(phone)}
              </span>{" "}
              فرستادیم.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                verify(code);
              }}
              noValidate
              className="mx-auto mt-8 flex max-w-md flex-col items-center gap-4"
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
                <p className="text-sm text-destructive" role="alert">
                  {error}
                </p>
              ) : notice ? (
                <p className="text-sm text-brand-700">{notice}</p>
              ) : null}
              <Button
                type="submit"
                disabled={loading}
                className="h-12 w-full gap-2 rounded-full px-7 text-base font-semibold"
              >
                {loading ? <Loader2 className="size-4 animate-spin" /> : null}
                تأیید و عضویت
              </Button>
              <div className="flex w-full items-center justify-between text-sm">
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
          </>
        )}
      </div>
    </Section>
  );
}
