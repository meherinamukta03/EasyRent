"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Mail, MapPin, Pencil, Phone, UserRound, X } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { showError, showSuccess } from "@/components/ui/toast";
import {
  updateProfile,
  type ProfileUpdateResult,
} from "@/lib/actions/profile";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export interface ProfileUser {
  name: string;
  email: string;
  image?: string | null;
  phone?: string | null;
  address?: string | null;
  role?: string | null;
}

function getInitials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "ER"
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof UserRound;
  label: string;
  value?: string | null;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-slate-50 px-4 py-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-emerald-600" aria-hidden="true" />
      <div className="min-w-0">
        <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
          {label}
        </p>
        <p className="mt-1 text-sm font-medium break-words text-slate-900">
          {value || "Not provided"}
        </p>
      </div>
    </div>
  );
}

export default function ProfileForm({ user }: { user: ProfileUser }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);

  const [profile, setProfile] = useState<ProfileUser>(user);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone || "");
  const [address, setAddress] = useState(user.address || "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;

    if (!file) {
      setImageFile(null);
      setPreviewUrl(null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      showError("Please select a valid image file");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      showError("Image must be smaller than 5 MB");
      event.target.value = "";
      return;
    }

    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
    }

    const url = URL.createObjectURL(file);

    previewUrlRef.current = url;
    setImageFile(file);
    setPreviewUrl(url);
  }

  function handleCancel() {
    setName(profile.name);
    setPhone(profile.phone || "");
    setAddress(profile.address || "");
    setImageFile(null);

    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }

    setPreviewUrl(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setIsEditing(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSaving) return;

    const trimmedName = name.trim();

    if (!trimmedName) {
      showError("Name is required");
      return;
    }

    if (phone.trim() && !/^\d{7,15}$/.test(phone.replace(/[\s-]/g, ""))) {
      showError("Enter a valid phone number");
      return;
    }

    if (address.trim() && address.trim().length < 5) {
      showError("Address must be at least 5 characters");
      return;
    }

    const formData = new FormData();

    formData.set("name", trimmedName);
    formData.set("phone", phone.trim());
    formData.set("address", address.trim());

    if (imageFile) {
      formData.set("image", imageFile);
    }

    setIsSaving(true);

    try {
      const updated: ProfileUpdateResult = await updateProfile(formData);

      setProfile((current) => ({ ...current, ...updated }));
      setName(updated.name);
      setPhone(updated.phone || "");
      setAddress(updated.address || "");
      setImageFile(null);

      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
      }

      setPreviewUrl(null);
      setIsEditing(false);
      showSuccess("Profile updated successfully");
      router.refresh();
    } catch (updateError) {
      showError(
        updateError instanceof Error
          ? updateError.message
          : "Failed to update profile"
      );
    } finally {
      setIsSaving(false);
    }
  }

  const displayImage = previewUrl || profile.image;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div className="flex items-center gap-4">
          <Avatar className="size-16 border border-slate-200">
            {displayImage ? (
              <AvatarImage src={displayImage} alt={profile.name} />
            ) : null}
            <AvatarFallback className="bg-emerald-50 text-lg font-bold text-emerald-700">
              {getInitials(profile.name)}
            </AvatarFallback>
          </Avatar>

          <div>
            <h2 className="text-xl font-bold text-slate-900">{profile.name}</h2>
            <p className="text-sm text-slate-500">{profile.email}</p>
            {profile.role ? (
              <span className="mt-1 inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold capitalize text-emerald-700">
                {profile.role}
              </span>
            ) : null}
          </div>
        </div>

        {!isEditing ? (
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsEditing(true)}
          >
            <Pencil aria-hidden="true" />
            Edit Profile
          </Button>
        ) : null}
      </div>

      {!isEditing ? (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <InfoRow icon={UserRound} label="Name" value={profile.name} />
          <InfoRow icon={Mail} label="Email" value={profile.email} />
          <InfoRow icon={Phone} label="Phone Number" value={profile.phone} />
          <InfoRow icon={MapPin} label="Address" value={profile.address} />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label
              htmlFor="profile-name"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Name <span className="text-red-500">*</span>
            </label>
            <Input
              id="profile-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Your full name"
              required
              className="h-11"
            />
          </div>

          <div>
            <label
              htmlFor="profile-email"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Email
            </label>
            <Input
              id="profile-email"
              value={profile.email}
              disabled
              className="h-11 bg-slate-50 text-slate-500"
            />
            <p className="mt-1.5 text-xs text-slate-500">
              Email cannot be changed here.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="profile-phone"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Phone Number
              </label>
              <Input
                id="profile-phone"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="01XXXXXXXXX"
                inputMode="tel"
                className="h-11"
              />
            </div>

            <div>
              <label
                htmlFor="profile-address"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Address
              </label>
              <Input
                id="profile-address"
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                placeholder="Your address"
                className="h-11"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="profile-image"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Profile Image
            </label>
            <div className="flex flex-wrap items-center gap-4">
              <Avatar className="size-14 border border-slate-200">
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
                  className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-5">
            <Button type="submit" disabled={isSaving}>
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
            >
              Cancel
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
