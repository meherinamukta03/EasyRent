"use client";

import Link from "next/link";
import { useState } from "react";
import {
  AlertTriangle,
  Eye,
  ImageOff,
  Loader2,
  Package,
  Pencil,
  Trash2,
} from "lucide-react";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { showError, showSuccess } from "@/components/ui/toast";
import { deleteMyEquipment } from "@/lib/actions/equipment";
import {
  getEquipmentStatusLabel,
  getEquipmentStatusTone,
} from "@/types/equipment";
import type { Equipment } from "@/types/equipment";

interface MyEquipmentTableProps {
  equipment: Equipment[];
}

const statusStyles = {
  approved: "bg-green-100 text-green-700",
  pending: "bg-amber-100 text-amber-700",
  rejected: "bg-red-100 text-red-700",
} as const;

function StatusBadge({ status }: { status?: string }) {
  const tone = getEquipmentStatusTone(status);

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[tone]}`}
    >
      {getEquipmentStatusLabel(status)}
    </span>
  );
}

function displayValue(value?: string | number | null) {
  if (value === undefined || value === null) return null;

  const text = String(value).trim();

  return text || null;
}

function formatPrice(value?: number) {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;

  return `৳${value.toLocaleString("en-US")}`;
}

function InfoRow({
  label,
  children,
}: {
  label: string;
  children?: React.ReactNode;
}) {
  if (children === undefined || children === null || children === "") {
    return null;
  }

  return (
    <div className="rounded-xl bg-slate-50 px-4 py-3">
      <dt className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-medium break-words text-slate-800">
        {children}
      </dd>
    </div>
  );
}

export default function MyEquipmentTable({
  equipment,
}: MyEquipmentTableProps) {
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(
    null
  );
  const [equipmentToDelete, setEquipmentToDelete] =
    useState<Equipment | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Keep the server-provided list as the source of truth, while immediately
  // hiding rows that were deleted in this session (no page reload needed).
  const items = equipment.filter((item) => !deletedIds.includes(item._id));

  const handleConfirmDelete = async () => {
    if (!equipmentToDelete || isDeleting) return;

    const deletedEquipment = equipmentToDelete;

    try {
      setIsDeleting(true);

      await deleteMyEquipment(deletedEquipment._id);

      setDeletedIds((current) => [...current, deletedEquipment._id]);
      setEquipmentToDelete(null);
      showSuccess("Equipment deleted successfully!");
    } catch (error) {
      console.error(error);

      showError(
        error instanceof Error ? error.message : "Failed to delete equipment"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const equipmentToView = selectedEquipment;

  return (
    <>
      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center md:p-14">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <Package className="h-8 w-8" />
          </div>

          <h2 className="text-lg font-bold text-slate-800">
            No equipment found
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            You have not added any equipment yet. Add your first equipment to
            start renting it out.
          </p>

          <Link
            href="/dashboard/owner/add-equipment"
            className="mt-6 inline-flex items-center justify-center rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            Add Equipment
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr className="text-xs font-semibold tracking-wide text-slate-600 uppercase">
                  <th className="px-6 py-4">Equipment Name</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Rental Price</th>
                  <th className="px-6 py-4">Available Quantity</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {items.map((item) => {
                  const price = formatPrice(item.rentalPrice);

                  return (
                    <tr
                      key={item._id}
                      className="text-sm transition hover:bg-slate-50/70"
                    >
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-800">
                          {item.name}
                        </p>

                        {displayValue(item.brand) && (
                          <p className="mt-1 text-xs text-slate-500">
                            {item.brand}
                            {displayValue(item.model)
                              ? ` · ${item.model}`
                              : ""}
                          </p>
                        )}
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {displayValue(item.category) || "—"}
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {price ? (
                          <>
                            <span className="font-semibold text-slate-800">
                              {price}
                            </span>
                            <span className="text-xs text-slate-500">
                              {" "}
                              / {(item.rentalType || "day").toLowerCase()}
                            </span>
                          </>
                        ) : (
                          "—"
                        )}
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {displayValue(item.quantity) ?? "—"}
                      </td>

                      <td className="px-6 py-4">
                        <StatusBadge status={item.status} />
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedEquipment(item)}
                            className="text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                          >
                            <Eye className="h-4 w-4" />
                            View Details
                          </Button>

                          <Link
                            href={`/dashboard/owner/my-equipment/${item._id}/edit`}
                            className="inline-flex h-7 items-center justify-center gap-1 rounded-lg px-2.5 text-[0.8rem] font-medium text-emerald-600 transition hover:bg-emerald-50 hover:text-emerald-700"
                          >
                            <Pencil className="h-4 w-4" />
                            Update
                          </Link>

                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setEquipmentToDelete(item)}
                            className="text-red-600 hover:bg-red-50 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View Details Dialog */}
      <Dialog
        open={Boolean(equipmentToView)}
        onOpenChange={(open) => {
          if (!open) setSelectedEquipment(null);
        }}
      >
        {equipmentToView && (
          <DialogContent className="max-h-[90vh] overflow-y-auto p-0 sm:max-w-3xl">
            <div className="border-b border-slate-200 bg-slate-50 px-6 py-5">
              <DialogHeader className="gap-1 pr-10">
                <DialogTitle className="text-xl font-bold text-slate-900">
                  Equipment Details
                </DialogTitle>

                <DialogDescription>
                  Full information for {equipmentToView.name}.
                </DialogDescription>
              </DialogHeader>
            </div>

            <div className="space-y-6 px-6 pb-2">
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                {equipmentToView.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={equipmentToView.image}
                    alt={equipmentToView.name}
                    className="h-64 w-full object-contain md:h-80"
                  />
                ) : (
                  <div className="flex h-52 flex-col items-center justify-center gap-2 text-slate-400">
                    <ImageOff className="h-8 w-8" />
                    <span className="text-sm">No image available</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {equipmentToView.name}
                  </h3>

                  {displayValue(equipmentToView.category) && (
                    <p className="text-sm text-slate-500">
                      {equipmentToView.category}
                    </p>
                  )}
                </div>

                <StatusBadge status={equipmentToView.status} />
              </div>

              <dl className="grid gap-3 sm:grid-cols-2">
                <InfoRow label="Equipment Name">
                  {displayValue(equipmentToView.name)}
                </InfoRow>

                <InfoRow label="Category">
                  {displayValue(equipmentToView.category)}
                </InfoRow>

                <InfoRow label="Rental Price">
                  {formatPrice(equipmentToView.rentalPrice)}
                </InfoRow>

                <InfoRow label="Rental Type">
                  {displayValue(equipmentToView.rentalType)}
                </InfoRow>

                <InfoRow label="Available Quantity">
                  {displayValue(equipmentToView.quantity)}
                </InfoRow>

                <InfoRow label="Condition">
                  {displayValue(equipmentToView.condition)}
                </InfoRow>

                <InfoRow label="Location">
                  {displayValue(equipmentToView.location)}
                </InfoRow>

                <InfoRow label="Status">
                  <StatusBadge status={equipmentToView.status} />
                </InfoRow>

                <InfoRow label="Brand">
                  {displayValue(equipmentToView.brand)}
                </InfoRow>

                <InfoRow label="Model">
                  {displayValue(equipmentToView.model)}
                </InfoRow>

                <InfoRow label="Owner Name">
                  {displayValue(equipmentToView.ownerInfo?.name)}
                </InfoRow>

                <InfoRow label="Owner Email">
                  {displayValue(equipmentToView.ownerInfo?.email)}
                </InfoRow>

                <div className="sm:col-span-2">
                  <InfoRow label="Description">
                    {displayValue(equipmentToView.description)}
                  </InfoRow>
                </div>

                <div className="sm:col-span-2">
                  <InfoRow label="Rental Terms & Conditions">
                    {displayValue(equipmentToView.terms) ? (
                      <span className="whitespace-pre-wrap">
                        {displayValue(equipmentToView.terms)}
                      </span>
                    ) : null}
                  </InfoRow>
                </div>

                <div className="sm:col-span-2">
                  <InfoRow label="Equipment ID">
                    <span className="font-mono text-xs">
                      {displayValue(equipmentToView._id)}
                    </span>
                  </InfoRow>
                </div>
              </dl>
            </div>

            <DialogFooter className="mx-0 mb-0 rounded-b-2xl border-t px-6 py-4">
              <DialogClose render={<Button type="button" variant="outline" />}>
                Close
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={Boolean(equipmentToDelete)}
        onOpenChange={(open) => {
          if (!open && !isDeleting) setEquipmentToDelete(null);
        }}
      >
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-red-50 text-red-600">
              <AlertTriangle className="h-5 w-5" />
            </AlertDialogMedia>

            <AlertDialogTitle className="text-lg font-bold text-slate-900">
              Delete Equipment?
            </AlertDialogTitle>

            <AlertDialogDescription>
              Are you sure you want to delete this equipment? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {equipmentToDelete && (
            <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">
              {equipmentToDelete.name}
            </p>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>

            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Delete
                </>
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
