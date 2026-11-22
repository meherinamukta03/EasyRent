"use client"

import Image from "next/image"
import { useState } from "react"
import { CloudUpload } from "lucide-react"

import { AddEquip } from "@/lib/actions/adEquip"
import { authClient } from "@/lib/auth-client"
import EquipmentFormFields, {
  equipmentInputClass,
  equipmentLabelClass,
} from "@/components/owner/EquipmentFormFields"
import { showError, showSuccess } from "@/components/ui/toast"

const MAX_IMAGE_SIZE = 5 * 1024 * 1024

export default function AddEquipmentForm() {
  const { data: session } = authClient.useSession()

  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState("")
  const [loading, setLoading] = useState(false)

  // Image Change
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

  // Form Submit
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Store form reference before await
    const form = e.currentTarget

    if (!image) {
      showError("Please select an equipment image")
      return
    }

    if (!session?.user) {
      showError("Please login first")
      return
    }

    try {
      const formData = new FormData(form)

      setLoading(true)

      formData.set(
        "ownerInfo",
        JSON.stringify({
          name: session.user.name,
          email: session.user.email,
        })
      )

      formData.set("status", "Pending")

      const result = await AddEquip(formData)

      console.log(result)

      showSuccess("Equipment added successfully!")

      // Reset form
      form.reset()
      setImage(null)
      setPreview("")
    } catch (error) {
      console.error(error)

      const message =
        error instanceof Error ? error.message : "Failed to add equipment"

      // A 413 means the upload still exceeds the Server Action body limit.
      // Avoid showing React's minified server-component error to the user.
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
        <p className="mb-2 text-sm font-semibold text-emerald-600">
          OWNER DASHBOARD
        </p>

        <h1 className="text-2xl font-bold text-slate-800 md:text-3xl">
          Add New Equipment
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          List your equipment and make it available for others to rent.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-7">
        <EquipmentFormFields disabled={loading} />

        {/* Equipment Image */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="mb-6 border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-800">
              Equipment Image
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Upload a clear image of your equipment.
            </p>
          </div>

          <label
            htmlFor="equipment-image"
            className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center transition hover:border-emerald-400 hover:bg-emerald-50"
          >
            <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CloudUpload className="h-7 w-7" />
            </span>

            <span className="font-semibold text-slate-700">
              Click to upload an image
            </span>

            <span className="mt-1 text-xs text-slate-500">
              PNG, JPG or JPEG
            </span>

            <input
              id="equipment-image"
              type="file"
              name="image"
              accept="image/*"
              onChange={handleImageChange}
              required
              disabled={loading}
              className="hidden"
            />
          </label>

          {preview && (
            <div className="relative mt-5 h-64 w-full overflow-hidden rounded-xl border border-slate-200">
              <Image
                src={preview}
                alt="Equipment preview"
                fill
                unoptimized
                className="object-contain"
              />
            </div>
          )}
        </section>

        {/* Owner Information */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="mb-6 border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-800">
              Owner Information
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Your account information.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className={equipmentLabelClass}>Owner Name</label>

              <input
                type="text"
                value={session?.user?.name || ""}
                readOnly
                className={`${equipmentInputClass} bg-slate-50`}
              />
            </div>

            <div>
              <label className={equipmentLabelClass}>Owner Email</label>

              <input
                type="email"
                value={session?.user?.email || ""}
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
            Your equipment will be submitted with Pending status.
          </p>
        </div>

        {/* Submit */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="reset"
            disabled={loading}
            onClick={() => {
              setImage(null)
              setPreview("")
            }}
            className="rounded-xl border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Reset Form
          </button>

          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-emerald-600 px-8 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Uploading..." : "Add Equipment"}
          </button>
        </div>
      </form>
    </div>
  )
}
