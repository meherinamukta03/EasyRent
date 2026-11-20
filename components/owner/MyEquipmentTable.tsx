
"use client";

import { useState } from "react";
import Link from "next/link";
import type { Equipment } from "@/app/dashboard/owner/my-equipment/page";

interface Props {
  equipment: Equipment[];
  onDelete: (id: string) => void;
}

export default function MyEquipmentTable({
  equipment,
  onDelete,
}: Props) {
  const [selectedEquipment, setSelectedEquipment] =
    useState<Equipment | null>(null);

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[750px] text-left">
          <thead className="bg-slate-50">
            <tr className="text-sm text-slate-600">
              <th className="px-6 py-4">Equipment Name</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Rental Price</th>
              <th className="px-6 py-4">Quantity</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {equipment.length > 0 ? (
              equipment.map((item) => (
                <tr key={item._id} className="text-sm">
                  <td className="px-6 py-4 font-semibold text-slate-800">
                    {item.name}
                  </td>

                  <td className="px-6 py-4 text-slate-600">
                    {item.category}
                  </td>

                  <td className="px-6 py-4 text-slate-600">
                    ৳{item.rentalPrice}/day
                  </td>

                  <td className="px-6 py-4 text-slate-600">
                    {item.quantity}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        item.status === "approved"
                          ? "bg-green-100 text-green-700"
                          : item.status === "rejected"
                          ? "bg-red-100 text-red-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setSelectedEquipment(item)}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        View
                      </button>

                      <Link
                        href={`/dashboard/owner/my-equipment/${item._id}/edit`}
                        className="font-medium text-green-600 hover:underline"
                      >
                        Update
                      </Link>

                      <button
                        onClick={() => onDelete(item._id)}
                        className="font-medium text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-12 text-center text-slate-500"
                >
                  No equipment found. Add your first equipment!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedEquipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">
                Equipment Details
              </h2>

              <button
                onClick={() => setSelectedEquipment(null)}
                className="text-xl text-slate-500 hover:text-red-500"
                aria-label="Close details"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <p>
                <strong>Name:</strong> {selectedEquipment.name}
              </p>

              <p>
                <strong>Category:</strong> {selectedEquipment.category}
              </p>

              <p>
                <strong>Rental Price:</strong> ৳
                {selectedEquipment.rentalPrice}/day
              </p>

              <p>
                <strong>Available Quantity:</strong>{" "}
                {selectedEquipment.quantity}
              </p>

              <p>
                <strong>Status:</strong> {selectedEquipment.status}
              </p>
            </div>

            <button
              onClick={() => setSelectedEquipment(null)}
              className="mt-6 w-full rounded-lg bg-emerald-600 py-2.5 font-semibold text-white hover:bg-emerald-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
