import type { Metadata } from "next";

import FavoritesTable from "@/components/customer/FavoritesTable";
import { requireRole } from "@/lib/auth-server";

export const metadata: Metadata = {
  title: "Favorites | EasyRent",
  description: "Equipment you have saved for later.",
};

export default async function FavoritesPage() {
  await requireRole("customer");

  return (
    <main className="min-h-screen bg-slate-50/70 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <header>
          <p className="text-xs font-bold tracking-[0.2em] text-emerald-600 uppercase">
            Customer dashboard
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Favorites
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Equipment you saved, with details and quick removal.
          </p>
        </header>

        <FavoritesTable />
      </div>
    </main>
  );
}
