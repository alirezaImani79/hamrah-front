import type { Metadata } from "next";

import { FindTripManager } from "@/components/dashboard/trips/find-trip-manager";

export const metadata: Metadata = {
  title: "پیداکردن سفر | همراه",
  description: "جستجوی سفرهای هم‌مسیر بر اساس ترجیحاتت.",
};

export default function FindTripPage() {
  return <FindTripManager />;
}
