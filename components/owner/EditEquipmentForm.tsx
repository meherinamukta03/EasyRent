"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { ArrowLeft, ImagePlus, Loader2, Save } from "lucide-react"

import EquipmentFormFields, {
  equipmentInputClass,
  equipmentLabelClass,
} from "@/components/owner/EquipmentFormFields"
import { showError, showSuccess } from "@/components/ui/toast"
import { updateMyEquipment } from "@/lib/actions/equipment"
import { getEquipmentStatusLabel } from "@/types/equipment"
import type { Equipment } from "@/types/equipment"

const MAX_IMAGE_SIZE = 5 * 1024 * 1024

interface EditEquipmentFormProps {
  equipment: Equipment
  ownerName: string
  ownerEmail: string
}

export default function EditEquipmentForm({
  equipment,
  ownerName,
  ownerEmail,
}: EditEquipmentFormProps) {
  const router = useRouter()

  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState("")
  const [loading, setLoading] = useState(false)

  const currentImage = preview || equipment.image || ""
  const status = getEquipmentStatusLabel(equipment.status)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]

    if (!file) return

    if (!file.type.startsWith("image/")) {
      showError("Please select an image file")
      e.target.value = ""
      return
    }

    if (file.size > MAX_IMAGE_SIZE) {
      showError("Image must be smaller than 5 MB")
      e.target.value = ""
      return
    }

    setImage(file)
    setPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (loading) return

    try {
      const formData = new FormData(e.currentTarget)
      formData.set("id", equipment._id)

      if (image) {
        formData.set("image", image)
      }

      setLoading(true)

      await updateMyEquipment(formData)

      showSuccess("Equipment updated successfully!")
      router.push("/dashboard/owner/my-equipment")
      router.refresh()
    } catch (error) {
      console.error(error)

      const message =
        error instanceof Error ? error.message : "Failed to update equipment"

      showError(
        /413|body exceeded|minified react error/i.test(message)
          ? "The image is too large to upload. Please use a smaller image (under 5 MB)."
          : message
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard/owner/my-equipment"
          className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-emerald-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to My Equipment
        </Link>

        <p className="mb-2 text-sm font-semibold text-emerald-600">
          OWNER DASHBOARD
        </p>

        <h1 className="text-2xl font-bold text-slate-800 md:text-3xl">
          Edit Equipment
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Update the details of {equipment.name}. Your approval status will not
          change.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-7">
        <EquipmentFormFields defaultValues={equipment} disabled={loading} />

        {/* Equipment Image */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="mb-6 border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-800">
              Equipment Image
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Keep the current image or upload a new one.
            </p>
          </div>

          <label
            htmlFor="equipment-image"
            className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center transition hover:border-emerald-400 hover:bg-emerald-50"
          >
            <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <ImagePlus className="h-7 w-7" />
            </span>

            <span className="font-semibold text-slate-700">
              Click to upload a new image
            </span>

            <span className="mt-1 text-xs text-slate-500">
              Leave empty to keep the current image. PNG, JPG or JPEG
            </span>

            <input
              id="equipment-image"
              type="file"
              name="image"
              accept="image/*"
              onChange={handleImageChange}
              disabled={loading}
              className="hidden"
            />
          </label>

          <div className="mt-5">
            <p className="mb-2 text-sm font-semibold text-slate-700">
              {image ? "New image preview" : "Current image"}
            </p>

            {currentImage ? (
              <div className="relative h-64 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentImage}
                  alt={equipment.name}
                  className="h-full w-full object-contain"
                />
              </div>
            ) : (
              <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500">
                No image available
              </div>
            )}
          </div>
        </section>

        {/* Owner Information */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="mb-6 border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-800">
              Owner Information
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              The owner details cannot be changed from this form.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className={equipmentLabelClass}>Owner Name</label>

              <input
                type="text"
                value={ownerName}
                readOnly
                className={`${equipmentInputClass} bg-slate-50`}
              />
            </div>

            <div>
              <label className={equipmentLabelClass}>Owner Email</label>

              <input
                type="email"
                value={ownerEmail}
                readOnly
                className={`${equipmentInputClass} bg-slate-50`}
              />
            </div>
          </div>
        </section>

        {/* Status */}
        <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />

          <p className="text-sm font-medium text-amber-800">
            Current status: {status}. Editing equipment does not reset its
            approval status.
          </p>
        </div>

        {/* Submit */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link
            href="/dashboard/owner/my-equipment"
            className="rounded-xl border border-slate-300 px-6 py-3 text-center text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-8 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
