import type { Metadata } from "next";

import AllEquipmentCatalog from "@/components/equipment/AllEquipmentCatalog";
import { fetchPublicEquipment } from "@/services/equipment.service";

export const metadata: Metadata = {
  title: "All Equipment | EasyRent",
  description:
    "Browse approved equipment available for rent. Search by name or location and filter by category and rental type.",
};

interface AllEquipmentPageProps {
  searchParams: Promise<{ category?: string | string[] }>;
}

export default async function AllEquipmentPage({
  searchParams,
}: AllEquipmentPageProps) {
  const { category } = await searchParams;
  const selectedCategory =
    typeof category === "string" ? category.trim() : "";

  let initialEquipment: Awaited<ReturnType<typeof fetchPublicEquipment>> = [];
  let initialError = false;

  try {
    initialEquipment = await fetchPublicEquipment(
      selectedCategory ? { category: selectedCategory } : {}
    );
  } catch {
    initialError = true;
  }

  return (
    <main className="min-h-screen bg-slate-50/70">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <p className="text-xs font-bold tracking-[0.2em] text-emerald-600 uppercase">
            Explore the catalogue
          </p>
          <h1 className="mt-3 max-w-3xl text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            Find the right equipment for your next project
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
            Browse all approved equipment from trusted owners. Search by name or
            location, then narrow results by category and rental type.
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <AllEquipmentCatalog
          initialEquipment={initialEquipment}
          initialError={initialError}
          initialCategory={selectedCategory}
        />
      </section>
    </main>
  );
}
