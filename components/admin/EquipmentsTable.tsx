"use client"

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react"
import {
  AlertTriangle,
  Check,
  ImageOff,
  Loader2,
  Package,
  Pencil,
  Search,
  Trash2,
  X,
} from "lucide-react"

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { showError, showSuccess } from "@/components/ui/toast"
import {
  adminSelectClass,
  EmptyState,
  ErrorNotice,
  equipmentStatusTone,
  formatCurrency,
  StatusBadge,
} from "@/components/admin/AdminUI"
import { ADMIN_EQUIPMENT_STATUSES } from "@/constants/admin"
import {
  EQUIPMENT_CATEGORIES,
  EQUIPMENT_CONDITIONS,
  EQUIPMENT_RENTAL_TYPES,
} from "@/constants/equipment"
import {
  deleteAdminEquipment,
  getAdminEquipments,
  setAdminEquipmentStatus,
  updateAdminEquipment,
} from "@/lib/actions/admin"
import type {
  AdminEquipment,
  AdminEquipmentUpdateInput,
} from "@/types/admin"

type EditForm = Omit<AdminEquipmentUpdateInput, "id" | "rentalPrice" | "quantity"> & {
  rentalPrice: string
  quantity: string
}

function toEditForm(item: AdminEquipment): EditForm {
  return {
    name: item.name || "",
    description: item.description || "",
    category: item.category || "",
    location: item.location || "",
    rentalPrice: String(item.rentalPrice ?? ""),
    rentalType: item.rentalType || "Daily",
    quantity: String(item.quantity ?? ""),
    condition: item.condition || "Good",
    brand: item.brand || "",
    model: item.model || "",
    terms: item.terms || "",
  }
}

function displayValue(value?: string | number | null) {
  if (value === undefined || value === null) return null
  const text = String(value).trim()
  return text || null
}

export default function EquipmentsTable() {
  const [equipments, setEquipments] = useState<AdminEquipment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [busyId, setBusyId] = useState<string | null>(null)
  const [busyAction, setBusyAction] = useState<string>("")

  const [editTarget, setEditTarget] = useState<AdminEquipment | null>(null)
  const [editForm, setEditForm] = useState<EditForm | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AdminEquipment | null>(null)

  const requestRef = useRef(0)

  const loadEquipments = useCallback(async (silent = false) => {
    const currentRequest = ++requestRef.current

    if (!silent) setIsLoading(true)
    setError(null)

    try {
      const data = await getAdminEquipments()

      if (requestRef.current !== currentRequest) return
      setEquipments(data)
    } catch (fetchError) {
      if (requestRef.current !== currentRequest) return
      setEquipments([])
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "Failed to load equipment"
      )
    } finally {
      if (requestRef.current === currentRequest) setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadEquipments()
  }, [loadEquipments])

  const filteredEquipments = equipments.filter((item) => {
    const matchesStatus =
      statusFilter === "all" ||
      String(item.status || "Pending") === statusFilter
    const term = search.trim().toLowerCase()
    const matchesSearch =
      !term ||
      item.name?.toLowerCase().includes(term) ||
      item.ownerInfo?.email?.toLowerCase().includes(term) ||
      item.category?.toLowerCase().includes(term)

    return matchesStatus && matchesSearch
  })

  async function handleStatus(item: AdminEquipment, status: "Approved" | "Rejected") {
    if (busyId) return

    setBusyId(item._id)
    setBusyAction(status)

    try {
      const message = await setAdminEquipmentStatus(item._id, status)

      setEquipments((current) =>
        current.map((entry) =>
          entry._id === item._id ? { ...entry, status } : entry
        )
      )
      showSuccess(message)
      void loadEquipments(true)
    } catch (actionError) {
      showError(
        actionError instanceof Error
          ? actionError.message
          : "Failed to update equipment status"
      )
    } finally {
      setBusyId(null)
      setBusyAction("")
    }
  }

  async function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!editTarget || !editForm || busyId) return

    setBusyId(editTarget._id)
    setBusyAction("update")

    try {
      const message = await updateAdminEquipment({
        id: editTarget._id,
        name: editForm.name,
        description: editForm.description,
        category: editForm.category,
        location: editForm.location,
        rentalPrice: Number(editForm.rentalPrice),
        rentalType: editForm.rentalType,
        quantity: Number(editForm.quantity),
        condition: editForm.condition,
        brand: editForm.brand,
        model: editForm.model,
        terms: editForm.terms,
      })

      setEditTarget(null)
      setEditForm(null)
      showSuccess(message)
      void loadEquipments(true)
    } catch (actionError) {
      showError(
        actionError instanceof Error
          ? actionError.message
          : "Failed to update equipment"
      )
    } finally {
      setBusyId(null)
      setBusyAction("")
    }
  }

  async function handleDelete() {
    if (!deleteTarget || busyId) return

    setBusyId(deleteTarget._id)
    setBusyAction("delete")

    try {
      const message = await deleteAdminEquipment(deleteTarget._id)

      setEquipments((current) =>
        current.filter((entry) => entry._id !== deleteTarget._id)
      )
      setDeleteTarget(null)
      showSuccess(message)
    } catch (actionError) {
      showError(
        actionError instanceof Error
          ? actionError.message
          : "Failed to delete equipment"
      )
    } finally {
      setBusyId(null)
      setBusyAction("")
    }
  }

  function openEdit(item: AdminEquipment) {
    setEditTarget(item)
    setEditForm(toEditForm(item))
  }

  return (
    <div className="space-y-4">
      {error ? (
        <ErrorNotice message={error} onRetry={() => void loadEquipments()} />
      ) : null}

      <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xl shadow-slate-900/[0.04]">
        <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/60 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              All equipment listings
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Review, approve, edit and remove items from the catalogue.
            </p>
          </div>
          {!isLoading && !error ? (
            <Badge
              variant="outline"
              className="self-start border-emerald-200 bg-white px-3 py-1 text-xs font-semibold text-emerald-700 sm:self-auto"
            >
              {filteredEquipments.length}{" "}
              {filteredEquipments.length === 1 ? "item" : "items"}
            </Badge>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:px-6">
          <div className="relative flex-1">
            <Search
              className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search equipment, category or owner email"
              aria-label="Search equipment"
              className="h-10 rounded-xl border-slate-200 bg-white pl-9"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label="Filter by status"
            className={`${adminSelectClass} sm:w-48`}
          >
            <option value="all">All statuses</option>
            {ADMIN_EQUIPMENT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 px-6 py-16 text-sm text-slate-500">
            <Loader2
              className="size-4 animate-spin text-emerald-600"
              aria-hidden="true"
            />
            Loading equipment…
          </div>
        ) : filteredEquipments.length > 0 ? (
          <div className="overflow-x-auto">
            <Table className="min-w-[1080px]">
              <TableHeader className="bg-white">
                <TableRow className="border-slate-200 bg-slate-50/70 text-xs font-bold tracking-wide text-slate-500 uppercase">
                  <TableHead className="px-5 sm:px-6">Equipment</TableHead>
                  <TableHead className="px-5 sm:px-6">Category</TableHead>
                  <TableHead className="px-5 sm:px-6">Owner</TableHead>
                  <TableHead className="px-5 sm:px-6">Price / Type</TableHead>
                  <TableHead className="px-5 sm:px-6">Availability</TableHead>
                  <TableHead className="px-5 sm:px-6">Status</TableHead>
                  <TableHead className="px-5 text-right sm:px-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEquipments.map((item) => {
                  const isBusy = busyId === item._id
                  const available = Number(item.quantity || 0) > 0

                  return (
                    <TableRow
                      key={item._id}
                      className="border-slate-100 transition hover:bg-emerald-50/40"
                    >
                      <TableCell className="px-5 py-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                            {item.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={item.image}
                                alt={item.name}
                                className="size-full object-cover"
                              />
                            ) : (
                              <ImageOff
                                className="size-5 text-slate-400"
                                aria-hidden="true"
                              />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="max-w-52 truncate font-semibold text-slate-900">
                              {item.name}
                            </p>
                            {displayValue(item.brand) ? (
                              <p className="mt-0.5 truncate text-xs text-slate-500">
                                {item.brand}
                                {displayValue(item.model)
                                  ? ` · ${item.model}`
                                  : ""}
                              </p>
                            ) : null}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-slate-600 sm:px-6">
                        {displayValue(item.category) || "—"}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6">
                        <p className="text-slate-700">
                          {item.ownerInfo?.name || "—"}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {item.ownerInfo?.email || "—"}
                        </p>
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6">
                        <p className="font-semibold text-slate-900">
                          {formatCurrency(item.rentalPrice)}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          / {String(item.rentalType || "Daily").toLowerCase()}
                        </p>
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6">
                        <div className="flex flex-col items-start gap-1">
                          <StatusBadge
                            value={available ? "Available" : "Unavailable"}
                            tone={available ? "success" : "danger"}
                          />
                          <span className="text-xs text-slate-500">
                            {Number(item.quantity || 0)} in stock
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6">
                        <StatusBadge
                          value={
                            item.status
                              ? item.status.charAt(0).toUpperCase() + item.status.slice(1)
                              : "Pending"
                          }
                          tone={equipmentStatusTone(item.status)}
                        />
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={Boolean(isBusy) || item.status === "Approved"}
                            onClick={() => void handleStatus(item, "Approved")}
                            title="Approve this listing"
                            className="text-emerald-700 hover:bg-emerald-50 disabled:opacity-40"
                          >
                            {isBusy && busyAction === "Approved" ? (
                              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                            ) : (
                              <Check className="size-4" aria-hidden="true" />
                            )}
                            Approve
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={Boolean(isBusy) || item.status === "Rejected"}
                            onClick={() => void handleStatus(item, "Rejected")}
                            title="Reject this listing"
                            className="text-amber-700 hover:bg-amber-50 disabled:opacity-40"
                          >
                            {isBusy && busyAction === "Rejected" ? (
                              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                            ) : (
                              <X className="size-4" aria-hidden="true" />
                            )}
                            Reject
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={Boolean(isBusy)}
                            onClick={() => openEdit(item)}
                            className="text-blue-700 hover:bg-blue-50 disabled:opacity-40"
                          >
                            <Pencil className="size-4" aria-hidden="true" />
                            Edit
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={Boolean(isBusy)}
                            onClick={() => setDeleteTarget(item)}
                            className="text-red-600 hover:bg-red-50 disabled:opacity-40"
                          >
                            <Trash2 className="size-4" aria-hidden="true" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <EmptyState
            icon={<Package className="size-7" aria-hidden="true" />}
            title={
              search || statusFilter !== "all"
                ? "No matching equipment"
                : "No equipment yet"
            }
            description={
              search || statusFilter !== "all"
                ? "Try a different search term or status filter."
                : "Equipment submitted by owners will appear here for review."
            }
          />
        )}
      </div>

      <Dialog
        open={Boolean(editTarget && editForm)}
        onOpenChange={(open) => {
          if (!open && !busyId) {
            setEditTarget(null)
            setEditForm(null)
          }
        }}
      >
        {editTarget && editForm ? (
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-slate-900">
                Edit equipment
              </DialogTitle>
              <DialogDescription>
                Update the listing details for {editTarget.name}. Approval
                status is managed separately.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={(event) => void handleUpdate(event)} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Equipment name" htmlFor="admin-eq-name">
                  <Input
                    id="admin-eq-name"
                    required
                    value={editForm.name}
                    onChange={(event) =>
                      setEditForm((current) =>
                        current ? { ...current, name: event.target.value } : current
                      )
                    }
                    className="h-10 rounded-xl border-slate-200"
                  />
                </Field>
                <Field label="Category" htmlFor="admin-eq-category">
                  <select
                    id="admin-eq-category"
                    required
                    value={editForm.category}
                    onChange={(event) =>
                      setEditForm((current) =>
                        current
                          ? { ...current, category: event.target.value }
                          : current
                      )
                    }
                    className={adminSelectClass}
                  >
                    <option value="">Select a category</option>
                    {EQUIPMENT_CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Rental price" htmlFor="admin-eq-price">
                  <Input
                    id="admin-eq-price"
                    type="number"
                    min="1"
                    step="0.01"
                    required
                    value={editForm.rentalPrice}
                    onChange={(event) =>
                      setEditForm((current) =>
                        current
                          ? { ...current, rentalPrice: event.target.value }
                          : current
                      )
                    }
                    className="h-10 rounded-xl border-slate-200"
                  />
                </Field>
                <Field label="Rental type" htmlFor="admin-eq-type">
                  <select
                    id="admin-eq-type"
                    required
                    value={editForm.rentalType}
                    onChange={(event) =>
                      setEditForm((current) =>
                        current
                          ? { ...current, rentalType: event.target.value }
                          : current
                      )
                    }
                    className={adminSelectClass}
                  >
                    {EQUIPMENT_RENTAL_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Quantity" htmlFor="admin-eq-quantity">
                  <Input
                    id="admin-eq-quantity"
                    type="number"
                    min="1"
                    step="1"
                    required
                    value={editForm.quantity}
                    onChange={(event) =>
                      setEditForm((current) =>
                        current ? { ...current, quantity: event.target.value } : current
                      )
                    }
                    className="h-10 rounded-xl border-slate-200"
                  />
                </Field>
                <Field label="Condition" htmlFor="admin-eq-condition">
                  <select
                    id="admin-eq-condition"
                    required
                    value={editForm.condition}
                    onChange={(event) =>
                      setEditForm((current) =>
                        current
                          ? { ...current, condition: event.target.value }
                          : current
                      )
                    }
                    className={adminSelectClass}
                  >
                    {EQUIPMENT_CONDITIONS.map((condition) => (
                      <option key={condition} value={condition}>
                        {condition}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Location" htmlFor="admin-eq-location">
                  <Input
                    id="admin-eq-location"
                    required
                    value={editForm.location}
                    onChange={(event) =>
                      setEditForm((current) =>
                        current ? { ...current, location: event.target.value } : current
                      )
                    }
                    className="h-10 rounded-xl border-slate-200"
                  />
                </Field>
                <Field label="Brand" htmlFor="admin-eq-brand">
                  <Input
                    id="admin-eq-brand"
                    value={editForm.brand}
                    onChange={(event) =>
                      setEditForm((current) =>
                        current ? { ...current, brand: event.target.value } : current
                      )
                    }
                    className="h-10 rounded-xl border-slate-200"
                  />
                </Field>
                <Field label="Model" htmlFor="admin-eq-model">
                  <Input
                    id="admin-eq-model"
                    value={editForm.model}
                    onChange={(event) =>
                      setEditForm((current) =>
                        current ? { ...current, model: event.target.value } : current
                      )
                    }
                    className="h-10 rounded-xl border-slate-200"
                  />
                </Field>
              </div>

              <Field label="Description" htmlFor="admin-eq-description">
                <Textarea
                  id="admin-eq-description"
                  required
                  value={editForm.description}
                  onChange={(event) =>
                    setEditForm((current) =>
                      current ? { ...current, description: event.target.value } : current
                    )
                  }
                  className="min-h-20 rounded-xl border-slate-200"
                />
              </Field>

              <Field label="Rental terms" htmlFor="admin-eq-terms">
                <Textarea
                  id="admin-eq-terms"
                  value={editForm.terms}
                  onChange={(event) =>
                    setEditForm((current) =>
                      current ? { ...current, terms: event.target.value } : current
                    )
                  }
                  className="min-h-20 rounded-xl border-slate-200"
                />
              </Field>

              <DialogFooter>
                <DialogClose
                  render={<Button type="button" variant="outline" disabled={Boolean(busyId)} />}
                >
                  Cancel
                </DialogClose>
                <Button
                  type="submit"
                  disabled={Boolean(busyId)}
                  className="bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  {busyId ? (
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  ) : null}
                  Save changes
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        ) : null}
      </Dialog>

      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open && !busyId) setDeleteTarget(null)
        }}
      >
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-red-50 text-red-600">
              <AlertTriangle className="size-5" />
            </AlertDialogMedia>
            <AlertDialogTitle className="text-lg font-bold text-slate-900">
              Delete equipment?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the listing. Existing rental records are
              preserved. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {deleteTarget ? (
            <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">
              {deleteTarget.name}
            </p>
          ) : null}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={Boolean(busyId)}>Cancel</AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={Boolean(busyId)}
              onClick={() => void handleDelete()}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {busyId ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Deleting…
                </>
              ) : (
                <>
                  <Trash2 className="size-4" aria-hidden="true" />
                  Delete
                </>
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string
  htmlFor: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="text-sm font-semibold text-slate-700">
        {label}
      </label>
      {children}
    </div>
  )
}
