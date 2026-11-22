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
  Loader2,
  Mail,
  MapPin,
  Pencil,
  Phone,
  UserRound,
  X,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { showError, showSuccess } from "@/components/ui/toast"
import { updateProfile, type ProfileUpdateResult } from "@/lib/actions/profile"

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

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current)
      }
    }
  }, [])

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null

    if (!file) {
      setImageFile(null)
      setPreviewUrl(null)
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

  function handleCancel() {
    setName(profile.name)
    setPhone(profile.phone || "")
    setAddress(profile.address || "")
    setImageFile(null)

    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current)
      previewUrlRef.current = null
    }

    setPreviewUrl(null)

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }

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

    const formData = new FormData()

    formData.set("name", trimmedName)
    formData.set("phone", phone.trim())
    formData.set("address", address.trim())

    if (imageFile) {
      formData.set("image", imageFile)
    }

    setIsSaving(true)

    try {
      const updated: ProfileUpdateResult = await updateProfile(formData)

      setProfile((current) => ({ ...current, ...updated }))
      setName(updated.name)
      setPhone(updated.phone || "")
      setAddress(updated.address || "")
      setImageFile(null)

      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current)
        previewUrlRef.current = null
      }

      setPreviewUrl(null)
      setIsEditing(false)
      showSuccess("Profile updated successfully")
      router.refresh()
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

  const displayImage = previewUrl || profile.image

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xl shadow-slate-900/[0.04]">
      <div className="relative bg-linear-to-r from-slate-50 via-white to-emerald-50/60 px-5 py-6 sm:px-8 sm:py-8">
        <div
          aria-hidden="true"
          className="absolute -top-16 right-10 size-40 rounded-full bg-emerald-100/50 blur-3xl"
        />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4 sm:gap-5">
            <Avatar className="size-20 border-2 border-white shadow-lg ring-1 shadow-slate-900/10 ring-emerald-100">
              {displayImage ? (
                <AvatarImage src={displayImage} alt={profile.name} />
              ) : null}
              <AvatarFallback className="bg-emerald-100 text-xl font-bold text-emerald-700">
                {getInitials(profile.name)}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0">
              <h2 className="truncate text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                {profile.name}
              </h2>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                <Mail className="size-3.5 shrink-0" aria-hidden="true" />
                <span className="truncate">{profile.email}</span>
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {profile.role ? (
                  <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 capitalize">
                    {profile.role}
                  </span>
                ) : null}
                <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-xs font-semibold text-slate-500">
                  EasyRent member
                </span>
              </div>
            </div>
          </div>

          {!isEditing ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditing(true)}
              className="h-10 rounded-full border-emerald-200 bg-white px-5 text-sm font-semibold text-emerald-700 shadow-sm hover:border-emerald-300 hover:bg-emerald-50"
            >
              <Pencil aria-hidden="true" />
              Edit Profile
            </Button>
          ) : null}
        </div>
      </div>

      {!isEditing ? (
        <div className="px-5 py-6 sm:px-8 sm:py-8">
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
            <InfoRow icon={MapPin} label="Address" value={profile.address} />
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="space-y-6 px-5 py-6 sm:px-8 sm:py-8"
        >
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
              <h3 className="text-sm font-bold text-slate-900">
                Profile photo
              </h3>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <Avatar className="size-16 border border-slate-200 bg-white shadow-sm">
                {displayImage ? (
                  <AvatarImage src={displayImage} alt={profile.name} />
                ) : null}
                <AvatarFallback className="bg-emerald-50 font-bold text-emerald-700">
                  {getInitials(name || profile.name)}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1">
                <input
                  ref={fileInputRef}
                  id="profile-image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-emerald-700 hover:file:bg-emerald-100"
                />
                <p className="mt-1.5 text-xs text-slate-500">
                  JPG, PNG or WEBP. Maximum 5 MB.
                </p>
              </div>

              {previewUrl ? (
                <button
                  type="button"
                  onClick={handleCancel}
                  aria-label="Cancel image selection"
                  className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              ) : null}
            </div>
          </section>

          <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center">
            <Button
              type="submit"
              disabled={isSaving}
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
              disabled={isSaving}
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
