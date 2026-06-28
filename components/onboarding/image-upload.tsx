"use client";

import * as React from "react";
import { ImageUp, Loader2, RefreshCw, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { toPersianDigits } from "@/lib/format";
import { Label } from "@/components/ui/label";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

type ImageUploadProps = {
  id: string;
  label: React.ReactNode;
  hint?: React.ReactNode;
  value: File | null;
  onChange: (file: File | null) => void;
  /** Required error from the parent (e.g. "missing"). */
  error?: string;
  /** Camera facing hint for mobile: "user" = selfie, "environment" = document. */
  capture?: "user" | "environment";
};

/** Labeled image picker with preview, type/size validation and replace/remove. */
export function ImageUpload({
  id,
  label,
  hint,
  value,
  onChange,
  error,
  capture,
}: ImageUploadProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [localError, setLocalError] = React.useState<string | null>(null);

  // Derive the preview object URL from the file, and revoke it on change/unmount
  // so we never leak blob URLs.
  const preview = React.useMemo(
    () => (value ? URL.createObjectURL(value) : null),
    [value],
  );
  React.useEffect(() => {
    if (!preview) return;
    return () => URL.revokeObjectURL(preview);
  }, [preview]);

  function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    if (!ACCEPTED.includes(file.type)) {
      setLocalError("فرمت تصویر باید JPG، PNG یا WebP باشه.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setLocalError(`حجم تصویر نباید بیشتر از ${toPersianDigits(5)} مگابایت باشه.`);
      return;
    }
    setLocalError(null);
    onChange(file);
  }

  function handleRemove() {
    setLocalError(null);
    onChange(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  const shownError = localError ?? error;

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>
        {label}
        <span className="text-destructive">*</span>
      </Label>

      <input
        ref={inputRef}
        id={id}
        type="file"
        accept="image/*"
        capture={capture}
        className="sr-only"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {value && preview ? (
        <div
          className={cn(
            "relative overflow-hidden rounded-2xl border border-brand-200 bg-card",
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt=""
            className="max-h-56 w-full object-contain"
          />
          <div className="flex items-center justify-between gap-2 border-t border-border bg-muted/40 px-3 py-2">
            <span dir="ltr" className="truncate text-xs text-muted-foreground">
              {value.name}
            </span>
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-brand-700 transition-colors hover:bg-brand-50"
              >
                <RefreshCw className="size-3.5" />
                تغییر
              </button>
              <button
                type="button"
                onClick={handleRemove}
                aria-label="حذف تصویر"
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10"
              >
                <X className="size-3.5" />
                حذف
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={cn(
            "flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-input bg-card px-4 py-8 text-center transition-colors hover:border-brand-300 hover:bg-brand-50/40",
            shownError && "border-destructive bg-destructive/5",
          )}
        >
          <span className="flex size-11 items-center justify-center rounded-full bg-brand-50 text-brand-600">
            <ImageUp className="size-5" />
          </span>
          <span className="text-sm font-medium text-foreground">
            برای انتخاب تصویر بزن
          </span>
          {hint ? (
            <span className="text-xs text-muted-foreground">{hint}</span>
          ) : null}
        </button>
      )}

      {shownError ? (
        <p className="text-sm text-destructive" role="alert">
          {shownError}
        </p>
      ) : null}
    </div>
  );
}

/** A small spinner row, exported so steps can show an inline busy state. */
export function InlineSpinner({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
      <Loader2 className="size-4 animate-spin" />
      {label}
    </span>
  );
}
