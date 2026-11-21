import { notFound } from "next/navigation";

import EditEquipmentForm from "@/components/owner/EditEquipmentForm";
import { getMyEquipmentById } from "@/lib/actions/equipment";
import { requireRole } from "@/lib/auth-server";

interface EditEquipmentPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditEquipmentPage({
  params,
}: EditEquipmentPageProps) {
  const { id } = await params;
  const session = await requireRole("owner");
  const equipment = await getMyEquipmentById(id);

  if (!equipment) {
    notFound();
  }

  return (
    <div className="p-4 md:p-8">
      <EditEquipmentForm
        equipment={equipment}
        ownerName={session.user.name ?? ""}
        ownerEmail={session.user.email}
      />
    </div>
  );
}
