"use client"

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react"
import { useRouter } from "next/navigation"
import {
  Camera,
  Check,
  Loader2,
  Mail,
  MapPin,
  Pencil,
  Phone,
  ShieldCheck,
  Trash2,
  UserRound,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { showError, showSuccess } from "@/components/ui/toast"
import {
  removeProfileImage,
  updateProfile,
  type ProfileUpdateResult,
} from "@/lib/actions/profile"
import { notifyProfileUpdated } from "@/lib/profile-events"

const MAX_IMAGE_SIZE = 5 * 1024 * 1024

export interface ProfileUser {
  name: string
  email: string
  image?: string | null
  phone?: string | null
  address?: string | null
  role?: string | null
}

function getInitials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "ER"
  )
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof UserRound
  label: string
  value?: string | null
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-slate-200/70 bg-slate-50/60 p-4 transition-colors duration-200 hover:border-emerald-200 hover:bg-emerald-50/40">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm ring-1 ring-slate-200/70">
        <Icon className="size-4.5" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-[0.68rem] font-bold tracking-[0.14em] text-slate-500 uppercase">
          {label}
        </p>
        <p className="mt-1 text-sm font-semibold break-words text-slate-900">
          {value || "Not provided"}
        </p>
      </div>
    </div>
  )
}

function FieldLabel({
  htmlFor,
  children,
  optional = false,
}: {
  htmlFor: string
  children: React.ReactNode
  optional?: boolean
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-2 flex items-center gap-1 text-sm font-semibold text-slate-700"
    >
      {children}
      {optional ? (
        <span className="text-xs font-normal text-slate-400">(optional)</span>
      ) : null}
    </label>
  )
}

export default function ProfileForm({ user }: { user: ProfileUser }) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const previewUrlRef = useRef<string | null>(null)

  const [profile, setProfile] = useState<ProfileUser>(user)
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(user.name)
  const [phone, setPhone] = useState(user.phone || "")
  const [address, setAddress] = useState(user.address || "")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const [isRemovingPhoto, setIsRemovingPhoto] = useState(false)

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current)
      }
    }
  }, [])

  function resetPhotoSelection() {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current)
      previewUrlRef.current = null
    }

    setImageFile(null)
    setPreviewUrl(null)

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null

    if (!file) {
      resetPhotoSelection()
      return
    }

    if (!file.type.startsWith("image/")) {
      showError("Please select a valid image file")
      event.target.value = ""
      return
    }

    if (file.size > MAX_IMAGE_SIZE) {
      showError("Image must be smaller than 5 MB")
      event.target.value = ""
      return
    }

    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current)
    }

    const url = URL.createObjectURL(file)
    previewUrlRef.current = url
    setImageFile(file)
    setPreviewUrl(url)
  }

  function buildFormData() {
    const formData = new FormData()

    formData.set("name", name.trim())
    formData.set("phone", phone.trim())
    formData.set("address", address.trim())

    if (imageFile) {
      formData.set("image", imageFile)
    }

    return formData
  }

  function applyResult(result: ProfileUpdateResult) {
    setProfile((current) => ({ ...current, ...result }))
    setName(result.name)
    setPhone(result.phone || "")
    setAddress(result.address || "")
    resetPhotoSelection()

    // Refreshes the Navbar avatar in-place — no logout or page reload needed.
    notifyProfileUpdated()
    router.refresh()
  }

  function handleCancel() {
    setName(profile.name)
    setPhone(profile.phone || "")
    setAddress(profile.address || "")
    resetPhotoSelection()
    setIsEditing(false)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (isSaving) return

    const trimmedName = name.trim()

    if (!trimmedName) {
      showError("Name is required")
      return
    }

    if (phone.trim() && !/^\d{7,15}$/.test(phone.replace(/[\s-]/g, ""))) {
      showError("Enter a valid phone number")
      return
    }

    if (address.trim() && address.trim().length < 5) {
      showError("Address must be at least 5 characters")
      return
    }

    setIsSaving(true)

    try {
      const updated = await updateProfile(buildFormData())

      applyResult(updated)
      setIsEditing(false)
      showSuccess("Profile updated successfully")
    } catch (updateError) {
      showError(
        updateError instanceof Error
          ? updateError.message
          : "Failed to update profile"
      )
    } finally {
      setIsSaving(false)
    }
  }

  async function handleSavePhoto() {
    if (!imageFile || isUploadingPhoto || isSaving) return

    setIsUploadingPhoto(true)

    try {
      const updated = await updateProfile(buildFormData())

      applyResult(updated)
      showSuccess("Profile photo updated")
    } catch (updateError) {
      showError(
        updateError instanceof Error
          ? updateError.message
          : "Failed to upload profile photo"
      )
    } finally {
      setIsUploadingPhoto(false)
    }
  }

  async function handleRemovePhoto() {
    if (!profile.image || isRemovingPhoto || isUploadingPhoto) return

    setIsRemovingPhoto(true)

    try {
      const updated = await removeProfileImage()

      applyResult(updated)
      showSuccess("Profile photo removed")
    } catch (removeError) {
      showError(
        removeError instanceof Error
          ? removeError.message
          : "Failed to remove profile photo"
      )
    } finally {
      setIsRemovingPhoto(false)
    }
  }

  const displayImage = previewUrl || profile.image
  const isBusy = isSaving || isUploadingPhoto || isRemovingPhoto

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xl shadow-slate-900/[0.04]">
      {/* Hero */}
      <section className="relative overflow-hidden bg-linear-to-r from-slate-50 via-white to-emerald-50/60 px-5 py-8 sm:px-8 sm:py-10">
        <div
          aria-hidden="true"
          className="absolute -top-16 right-10 size-40 rounded-full bg-emerald-100/50 blur-3xl"
        />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center">
            <div className="relative shrink-0 self-center sm:self-auto">
              <Avatar className="size-28 border-4 border-white shadow-lg shadow-slate-900/10 ring-2 ring-emerald-100 sm:size-32">
                {displayImage ? (
                  <AvatarImage src={displayImage} alt={profile.name} />
                ) : null}
                <AvatarFallback className="bg-emerald-100 text-3xl font-bold text-emerald-700">
                  {getInitials(profile.name || profile.email)}
                </AvatarFallback>
              </Avatar>
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isBusy}
                  aria-label="Change profile photo"
                  title="Change profile photo"
                  className="absolute -right-1 -bottom-1 flex size-10 items-center justify-center rounded-full border-2 border-white bg-emerald-600 text-white shadow-md transition hover:bg-emerald-700 disabled:opacity-60"
                >
                  <Camera className="size-4.5" aria-hidden="true" />
                </button>
              ) : null}
            </div>

            <div className="min-w-0 text-center sm:text-left">
              <p className="text-[0.68rem] font-bold tracking-[0.16em] text-emerald-700 uppercase">
                My profile
              </p>
              <h2 className="mt-2 truncate text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                {profile.name}
              </h2>
              <p className="mt-2 flex items-center justify-center gap-1.5 text-sm text-slate-500 sm:justify-start">
                <Mail className="size-3.5 shrink-0" aria-hidden="true" />
                <span className="truncate">{profile.email}</span>
              </p>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                {profile.role ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 capitalize">
                    <ShieldCheck className="size-3.5" aria-hidden="true" />
                    {profile.role}
                  </span>
                ) : null}
                <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-500">
                  EasyRent member
                </span>
              </div>
            </div>
          </div>

          {!isEditing ? (
            <div className="flex flex-wrap items-center justify-center gap-2 lg:justify-end">
              <Button
                type="button"
                onClick={() => setIsEditing(true)}
                disabled={isBusy}
                className="h-11 rounded-full bg-emerald-600 px-6 text-sm font-semibold text-white shadow-sm shadow-emerald-600/20 hover:bg-emerald-700"
              >
                <Pencil aria-hidden="true" />
                Edit Profile
              </Button>
              {profile.image ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void handleRemovePhoto()}
                  disabled={isBusy}
                  className="h-11 rounded-full border-slate-200 px-5 text-sm font-semibold text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                >
                  {isRemovingPhoto ? (
                    <Loader2 className="animate-spin" aria-hidden="true" />
                  ) : (
                    <Trash2 aria-hidden="true" />
                  )}
                  Remove Photo
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>

        <input
          ref={fileInputRef}
          id="profile-image"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="sr-only"
          aria-label="Choose a profile photo"
        />

        {!isEditing && imageFile ? (
          <div className="relative mt-6 flex flex-col gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-center gap-2 text-sm font-medium text-emerald-800">
              <Check className="size-4 shrink-0" aria-hidden="true" />
              New photo selected. Preview is shown above.
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={() => void handleSavePhoto()}
                disabled={isBusy}
                className="h-9 rounded-full bg-emerald-600 px-4 text-xs font-semibold text-white hover:bg-emerald-700"
              >
                {isUploadingPhoto ? (
                  <Loader2 className="animate-spin" aria-hidden="true" />
                ) : null}
                Save photo
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={resetPhotoSelection}
                disabled={isBusy}
                className="h-9 rounded-full border-slate-200 px-4 text-xs font-semibold text-slate-600"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : null}
      </section>

      {!isEditing ? (
        <div className="px-5 py-7 sm:px-8 sm:py-9">
          <div className="mb-4 flex items-center gap-2">
            <h3 className="text-sm font-bold tracking-[0.14em] text-slate-500 uppercase">
              Personal information
            </h3>
            <span className="h-px flex-1 bg-slate-100" />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <InfoRow icon={UserRound} label="Full name" value={profile.name} />
            <InfoRow icon={Mail} label="Email address" value={profile.email} />
            <InfoRow icon={Phone} label="Phone number" value={profile.phone} />
            <InfoRow
              icon={ShieldCheck}
              label="Account role"
              value={profile.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : ""}
            />
            <InfoRow icon={MapPin} label="Address" value={profile.address} />
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6 px-5 py-7 sm:px-8 sm:py-9">
          <section className="rounded-2xl border border-slate-200/70 bg-slate-50/40 p-4 sm:p-6">
            <div className="mb-5 flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                <UserRound className="size-4" aria-hidden="true" />
              </span>
              <h3 className="text-sm font-bold text-slate-900">
                Personal information
              </h3>
            </div>

            <div className="space-y-5">
              <div>
                <FieldLabel htmlFor="profile-name">Full name</FieldLabel>
                <Input
                  id="profile-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Your full name"
                  required
                  className="h-11 rounded-xl border-slate-200 bg-white"
                />
              </div>

              <div>
                <FieldLabel htmlFor="profile-email">Email address</FieldLabel>
                <Input
                  id="profile-email"
                  value={profile.email}
                  disabled
                  className="h-11 rounded-xl border-slate-200 bg-slate-100 text-slate-500"
                />
                <p className="mt-1.5 text-xs text-slate-500">
                  Email cannot be changed here.
                </p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <FieldLabel htmlFor="profile-phone" optional>
                    Phone number
                  </FieldLabel>
                  <Input
                    id="profile-phone"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="01XXXXXXXXX"
                    inputMode="tel"
                    className="h-11 rounded-xl border-slate-200 bg-white"
                  />
                </div>

                <div>
                  <FieldLabel htmlFor="profile-address" optional>
                    Address
                  </FieldLabel>
                  <Input
                    id="profile-address"
                    value={address}
                    onChange={(event) => setAddress(event.target.value)}
                    placeholder="Your address"
                    className="h-11 rounded-xl border-slate-200 bg-white"
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200/70 bg-slate-50/40 p-4 sm:p-6">
            <div className="mb-5 flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                <Camera className="size-4" aria-hidden="true" />
              </span>
              <h3 className="text-sm font-bold text-slate-900">Profile photo</h3>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <Avatar className="size-16 border border-slate-200 bg-white shadow-sm">
                {displayImage ? (
                  <AvatarImage src={displayImage} alt={profile.name} />
                ) : null}
                <AvatarFallback className="bg-emerald-50 font-bold text-emerald-700">
                  {getInitials(name || profile.name || profile.email)}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isBusy}
                    className="h-9 rounded-full border-emerald-200 px-4 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
                  >
                    <Camera aria-hidden="true" />
                    Change Photo
                  </Button>
                  {profile.image ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => void handleRemovePhoto()}
                      disabled={isBusy}
                      className="h-9 rounded-full border-slate-200 px-4 text-xs font-semibold text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 aria-hidden="true" />
                      Remove Photo
                    </Button>
                  ) : null}
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  JPG, PNG or WEBP. Maximum 5 MB. Saved to ImgBB securely.
                </p>
              </div>
            </div>
          </section>

          <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center">
            <Button
              type="submit"
              disabled={isBusy}
              className="h-11 rounded-full bg-emerald-600 px-6 text-sm font-semibold text-white shadow-sm shadow-emerald-600/20 hover:bg-emerald-700"
            >
              {isSaving ? (
                <Loader2 className="animate-spin" aria-hidden="true" />
              ) : null}
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isBusy}
              className="h-11 rounded-full border-slate-200 px-6 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
