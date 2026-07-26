import type { Metadata } from "next";

import { TripDetailManager } from "@/components/dashboard/trips/trip-detail";

export const metadata: Metadata = {
  title: "جزئیات سفر | همراه",
  description: "اطلاعات راننده، هم‌سفرها و وضعیت سفر.",
};

export default async function TripDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TripDetailManager tripId={id} />;
}
