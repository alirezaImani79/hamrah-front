"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { ApiError, type Vehicle } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { errorMessage } from "@/lib/errors";
import { toLatinDigits, toPersianDigits } from "@/lib/format";
import {
  createVehicle,
  updateVehicle,
  type VehicleInput,
} from "@/lib/vehicles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field } from "@/components/onboarding/field";
import {
  PlateInput,
  isPlateComplete,
} from "@/components/dashboard/vehicles/plate-input";

type FormState = {
  name: string;
  model: string;
  number: string;
  color: string;
  seats: string;
};

type FieldErrors = Partial<Record<keyof FormState, string>>;

const EMPTY_FORM: FormState = {
  name: "",
  model: "",
  number: "",
  color: "",
  seats: "",
};

function toFormState(vehicle: Vehicle): FormState {
  return {
    name: vehicle.name,
    model: vehicle.model,
    number: vehicle.number,
    color: vehicle.color,
    seats: String(vehicle.seats),
  };
}

function validate(form: FormState): FieldErrors {
  const errors: FieldErrors = {};
  if (!form.name.trim()) errors.name = "نام خودرو رو وارد کن.";
  if (!form.model.trim()) errors.model = "مدل خودرو رو وارد کن.";
  if (!form.number.trim()) errors.number = "شماره پلاک رو وارد کن.";
  else if (!isPlateComplete(form.number))
    errors.number = "شماره پلاک رو کامل وارد کن.";
  if (!form.color.trim()) errors.color = "رنگ خودرو رو وارد کن.";

  const seats = Number(form.seats);
  if (!form.seats.trim()) errors.seats = "تعداد سرنشین رو وارد کن.";
  else if (!Number.isInteger(seats) || seats < 1 || seats > 100)
    errors.seats = "تعداد سرنشین باید عددی بین ۱ تا ۱۰۰ باشه.";

  return errors;
}

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Present → edit mode; absent → create mode. */
  vehicle?: Vehicle | null;
  /** Called with the created/updated vehicle after a successful save. */
  onSaved: (vehicle: Vehicle) => void;
};

export function VehicleFormDialog({
  open,
  onOpenChange,
  vehicle,
  onSaved,
}: Props) {
  const isEdit = Boolean(vehicle);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Seed the form each time the dialog opens (with the vehicle's data when
  // editing, or a clean slate when adding) and clear any leftover errors.
  useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm(vehicle ? toFormState(vehicle) : EMPTY_FORM);
    setErrors({});
    setSubmitError(null);
  }, [open, vehicle]);

  function update(patch: Partial<FormState>) {
    setForm((prev) => ({ ...prev, ...patch }));
    setErrors((prev) => {
      const next = { ...prev };
      for (const key of Object.keys(patch)) delete next[key as keyof FormState];
      return next;
    });
  }

  async function handleSubmit() {
    if (submitting) return;

    const found = validate(form);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }

    const token = getToken();
    if (!token) {
      setSubmitError("نشستت منقضی شده؛ برای ادامه دوباره وارد شو.");
      return;
    }

    const payload: VehicleInput = {
      name: form.name.trim(),
      model: form.model.trim(),
      number: form.number.trim(),
      color: form.color.trim(),
      seats: Number(form.seats),
    };

    setSubmitError(null);
    setSubmitting(true);
    try {
      const saved =
        vehicle != null
          ? await updateVehicle(token, vehicle.id, payload)
          : await createVehicle(token, payload);
      onSaved(saved);
      onOpenChange(false);
    } catch (err) {
      if (err instanceof ApiError && err.status === 422 && err.errors) {
        const mapped: FieldErrors = {};
        for (const key of Object.keys(form) as (keyof FormState)[]) {
          const message = err.fieldError(key);
          if (message) mapped[key] = message;
        }
        setErrors(mapped);
        if (Object.keys(mapped).length === 0) setSubmitError(errorMessage(err));
        return;
      }
      setSubmitError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        // Don't let the dialog close while a save is in flight.
        if (!submitting) onOpenChange(next);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "ویرایش خودرو" : "افزودن خودرو"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "اطلاعات خودروت رو به‌روزرسانی کن."
              : "اطلاعات خودروی جدیدت رو وارد کن."}
          </DialogDescription>
        </DialogHeader>

        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <Field label="نام خودرو" htmlFor="vehicle-name" error={errors.name}>
            <Input
              id="vehicle-name"
              value={form.name}
              onChange={(e) => update({ name: e.target.value })}
              placeholder="مثلاً خودروی اصلی"
              aria-invalid={Boolean(errors.name)}
              className="h-11 rounded-xl bg-card px-3.5 text-base"
            />
          </Field>

          <Field label="مدل" htmlFor="vehicle-model" error={errors.model}>
            <Input
              id="vehicle-model"
              value={form.model}
              onChange={(e) => update({ model: e.target.value })}
              placeholder="مثلاً پژو ۲۰۶"
              aria-invalid={Boolean(errors.model)}
              className="h-11 rounded-xl bg-card px-3.5 text-base"
            />
          </Field>

          <Field
            label="شماره پلاک"
            htmlFor="vehicle-number"
            error={errors.number}
          >
            <PlateInput
              id="vehicle-number"
              value={form.number}
              onChange={(number) => update({ number })}
              invalid={Boolean(errors.number)}
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="رنگ" htmlFor="vehicle-color" error={errors.color}>
              <Input
                id="vehicle-color"
                value={form.color}
                onChange={(e) => update({ color: e.target.value })}
                placeholder="مثلاً سفید"
                aria-invalid={Boolean(errors.color)}
                className="h-11 rounded-xl bg-card px-3.5 text-base"
              />
            </Field>

            <Field
              label="تعداد سرنشین"
              htmlFor="vehicle-seats"
              error={errors.seats}
            >
              <Input
                id="vehicle-seats"
                dir="ltr"
                inputMode="numeric"
                maxLength={3}
                value={toPersianDigits(form.seats)}
                onChange={(e) =>
                  update({
                    seats: toLatinDigits(e.target.value)
                      .replace(/\D/g, "")
                      .slice(0, 3),
                  })
                }
                placeholder="۴"
                aria-invalid={Boolean(errors.seats)}
                className="h-11 rounded-xl bg-card px-3.5 text-center text-base"
              />
            </Field>
          </div>

          {submitError ? (
            <p className="text-sm text-destructive" role="alert">
              {submitError}
            </p>
          ) : null}

          <DialogFooter className="mt-1">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
              className="h-11 rounded-xl"
            >
              انصراف
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="h-11 gap-1.5 rounded-xl font-semibold"
            >
              {submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  در حال ذخیره…
                </>
              ) : isEdit ? (
                "ذخیره تغییرات"
              ) : (
                "افزودن خودرو"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
