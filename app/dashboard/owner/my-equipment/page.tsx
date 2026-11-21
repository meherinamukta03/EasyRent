import Link from "next/link";
import { PackagePlus } from "lucide-react";

import MyEquipmentTable from "@/components/owner/MyEquipmentTable";
import { getMyEquipment } from "@/lib/actions/equipment";
import { requireRole } from "@/lib/auth-server";

export default async function MyEquipmentPage() {
  await requireRole("owner");

  const equipments = await getMyEquipment();

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-1 text-sm font-semibold text-emerald-600">
            OWNER DASHBOARD
          </p>

          <h1 className="text-2xl font-bold text-slate-800 md:text-3xl">
            My Equipment
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            View, update and manage the equipment you have listed.
          </p>
        </div>

        <Link
          href="/dashboard/owner/add-equipment"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
        >
          <PackagePlus className="h-4 w-4" />
          Add Equipment
        </Link>
      </div>

      <MyEquipmentTable equipment={equipments} />
    </div>
  );
}
