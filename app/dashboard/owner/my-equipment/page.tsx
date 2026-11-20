
"use client";

import MyEquipmentTable from "@/components/owner/MyEquipmentTable";
import { toast } from "@/components/ui/toast";
import { Toast } from "@base-ui/react";
import { useEffect, useState } from "react";



export interface Equipment {
  _id: string;
  name: string;
  category: string;
  rentalPrice: number;
  quantity: number;
  status: "pending" | "approved" | "rejected";
}

export default function MyEquipmentPage() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyEquipment = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SERVER_BASE_URL}/api/equipment/my-equipment`,
          {
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch equipment");
        }

        const data = await response.json();

        setEquipment(data.data || data);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load equipment");
      } finally {
        setLoading(false);
      }
    };

    fetchMyEquipment();
  }, []);

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this equipment?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_BASE_URL}/api/equipment/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Delete failed");
      }

      setEquipment((previous) =>
        previous.filter((item) => item._id !== id)
      );

      toast.success("Equipment deleted successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete equipment");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-60 items-center justify-center">
        <p className="text-gray-500">Loading equipment...</p>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          My Equipment
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Manage all equipment you have added for rental.
        </p>
      </div>

      <MyEquipmentTable
        equipment={equipment}
        onDelete={handleDelete}
      />
    </section>
  );
}
