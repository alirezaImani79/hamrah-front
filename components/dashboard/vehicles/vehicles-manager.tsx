"use client";

import { useEffect, useState } from "react";
import {
  Armchair,
  Car,
  Loader2,
  Palette,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";

import { type Vehicle } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { errorMessage } from "@/lib/errors";
import { toPersianDigits } from "@/lib/format";
import { deleteVehicle, listVehicles } from "@/lib/vehicles";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { VehicleFormDialog } from "@/components/dashboard/vehicles/vehicle-form-dialog";
import { PlateDisplay } from "@/components/dashboard/vehicles/plate-input";

type LoadState = "loading" | "ready" | "error";

export default function VehiclesManager() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("loading");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Vehicle | null>(null);

  const [pendingDelete, setPendingDelete] = useState<Vehicle | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function load() {
    const token = getToken();
    if (!token) {
      setLoadState("error");
      return;
    }
    setLoadState("loading");
    try {
      setVehicles(await listVehicles(token));
      setLoadState("ready");
    } catch {
      setLoadState("error");
    }
  }

  useEffect(() => {
    // Initial fetch on mount; `load` flips to "loading" synchronously, which is
    // fine here (the state already starts as "loading").
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  function openAdd() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(vehicle: Vehicle) {
    setEditing(vehicle);
    setFormOpen(true);
  }

  // Merge the created/updated vehicle into the list without a refetch.
  function handleSaved(saved: Vehicle) {
    setVehicles((prev) => {
      const exists = prev.some((v) => v.id === saved.id);
      return exists
        ? prev.map((v) => (v.id === saved.id ? saved : v))
        : [saved, ...prev];
    });
  }

  async function confirmDelete() {
    if (!pendingDelete || deleting) return;
    const token = getToken();
    if (!token) {
      setDeleteError("نشستت منقضی شده؛ برای ادامه دوباره وارد شو.");
      return;
    }
    setDeleteError(null);
    setDeleting(true);
    try {
      await deleteVehicle(token, pendingDelete.id);
      setVehicles((prev) => prev.filter((v) => v.id !== pendingDelete.id));
      setPendingDelete(null);
    } catch (err) {
      setDeleteError(errorMessage(err));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-foreground">خودروهای من</h1>
          <p className="text-sm leading-7 text-muted-foreground">
            خودروهات رو اضافه کن و مدیریت کن تا موقع ثبت سفر در دسترس باشن.
          </p>
        </div>
        <Button onClick={openAdd} className="gap-1.5 rounded-xl">
          <Plus className="size-4" />
          افزودن خودرو
        </Button>
      </div>

      {loadState === "loading" ? (
        <div className="flex items-center justify-center rounded-2xl border border-border bg-card py-16">
          <Loader2 className="size-6 animate-spin text-brand-600" />
        </div>
      ) : loadState === "error" ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 px-6 py-12 text-center">
          <p className="text-sm leading-7 text-muted-foreground">
            دریافت فهرست خودروها با مشکل مواجه شد.
          </p>
          <Button
            variant="outline"
            onClick={load}
            className="rounded-xl"
          >
            تلاش دوباره
          </Button>
        </div>
      ) : vehicles.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-brand-200 bg-brand-50/40 px-6 py-14 text-center">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-brand-100 text-brand-600">
            <Car className="size-7" />
          </span>
          <div className="flex flex-col gap-1">
            <p className="font-semibold text-foreground">هنوز خودرویی اضافه نکردی</p>
            <p className="mx-auto max-w-sm text-sm leading-7 text-muted-foreground">
              اولین خودروت رو اضافه کن تا بتونی باهاش سفر ثبت کنی.
            </p>
          </div>
          <Button onClick={openAdd} className="gap-1.5 rounded-xl">
            <Plus className="size-4" />
            افزودن خودرو
          </Button>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {vehicles.map((vehicle) => (
            <li key={vehicle.id}>
              <Card className="gap-4 p-5">
                <div className="flex items-start gap-3">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                    <Car className="size-5" />
                  </span>
                  <div className="flex min-w-0 flex-col">
                    <h2 className="truncate font-heading text-base font-semibold text-foreground">
                      {vehicle.name}
                    </h2>
                    <p className="truncate text-sm text-muted-foreground">
                      {vehicle.model}
                    </p>
                  </div>
                  <PlateDisplay
                    value={vehicle.number}
                    className="ms-auto shrink-0"
                  />
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <Palette className="size-4" />
                    {vehicle.color}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Armchair className="size-4" />
                    {toPersianDigits(vehicle.seats)} نفر
                  </span>
                </div>

                <div className="flex items-center gap-2 border-t border-border pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEdit(vehicle)}
                    className="gap-1.5 rounded-lg"
                  >
                    <Pencil className="size-3.5" />
                    ویرایش
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setDeleteError(null);
                      setPendingDelete(vehicle);
                    }}
                    className="gap-1.5 rounded-lg text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="size-3.5" />
                    حذف
                  </Button>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <VehicleFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        vehicle={editing}
        onSaved={handleSaved}
      />

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!deleting && !open) setPendingDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف خودرو</AlertDialogTitle>
            <AlertDialogDescription>
              مطمئنی می‌خوای «{pendingDelete?.name}» رو حذف کنی؟ این کار قابل
              بازگشت نیست.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError ? (
            <p className="text-sm text-destructive" role="alert">
              {deleteError}
            </p>
          ) : null}
          <AlertDialogFooter>
            <Button
              variant="outline"
              onClick={() => setPendingDelete(null)}
              disabled={deleting}
              className="rounded-xl"
            >
              انصراف
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleting}
              className="gap-1.5 rounded-xl"
            >
              {deleting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Trash2 className="size-4" />
              )}
              {deleting ? "در حال حذف…" : "حذف خودرو"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
