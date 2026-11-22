import AddEquipmentForm from "@/components/owner/AddEquipmentForm";
import { requireRole } from "@/lib/auth-server";

export default async function AddEquipmentPage() {
  await requireRole("owner");

  return (
    <div className="p-4 md:p-8">
      <AddEquipmentForm />
    </div>
  );
}
