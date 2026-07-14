import type { Metadata } from "next";

import TripsManager from "@/components/dashboard/trips/trips-manager";

export const metadata: Metadata = {
  title: "سفرهای من | همراه",
  description: "ثبت، ویرایش و حذف سفرهای کاربری همراه.",
};

export default function TripsPage() {
  return <TripsManager />;
}
