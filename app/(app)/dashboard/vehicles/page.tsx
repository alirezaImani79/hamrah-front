import type { Metadata } from "next";

import VehiclesManager from "@/components/dashboard/vehicles/vehicles-manager";

export const metadata: Metadata = {
  title: "خودروهای من | همراه",
  description: "افزودن، ویرایش و حذف خودروهای کاربری همراه.",
};

export default function VehiclesPage() {
  return <VehiclesManager />;
}
