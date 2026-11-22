"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { requireUser } from "@/lib/auth-server";
import { uploadImageToImgBB } from "@/lib/image-upload";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export interface ProfileUpdateResult {
  name: string;
  email: string;
  image?: string | null;
  phone?: string;
  address?: string;
}

/**
 * Updates only the signed-in user's own profile. The session is read from
 * request headers, so no client-provided id or email can target another user,
 * and `role` is never part of the update payload.
 */
export async function updateProfile(
  formData: FormData
): Promise<ProfileUpdateResult> {
  const session = await requireUser();

  const name = String(formData.get("name") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const address = String(formData.get("address") || "").trim();

  if (!name) {
    throw new Error("Name is required");
  }

  if (phone && !/^\d{7,15}$/.test(phone.replace(/[\s-]/g, ""))) {
    throw new Error("Enter a valid phone number");
  }

  if (address && address.length < 5) {
    throw new Error("Address must be at least 5 characters");
  }

  const image = formData.get("image");
  let imageUrl: string | undefined;

  if (image instanceof File && image.size > 0) {
    if (!image.type.startsWith("image/")) {
      throw new Error("Please select a valid image file");
    }

    if (image.size > MAX_IMAGE_SIZE) {
      throw new Error("Image must be smaller than 5 MB");
    }

    imageUrl = await uploadImageToImgBB(image);
  }

  await auth.api.updateUser({
    headers: await headers(),
    body: {
      name,
      phone,
      address,
      ...(imageUrl ? { image: imageUrl } : {}),
    },
  });

  revalidatePath("/dashboard/profile");

  return {
    name,
    email: session.user.email,
    image: imageUrl ?? session.user.image ?? null,
    phone,
    address,
  };
}

/**
 * Clears only the signed-in user's profile photo. The user is derived from the
 * server session, so no one can clear another account's image.
 */
export async function removeProfileImage(): Promise<ProfileUpdateResult> {
  const session = await requireUser();
  const currentUser = session.user as typeof session.user & {
    phone?: string | null;
    address?: string | null;
  };

  await auth.api.updateUser({
    headers: await headers(),
    body: { image: null },
  });

  revalidatePath("/dashboard/profile");

  return {
    name: currentUser.name || "",
    email: currentUser.email,
    image: null,
    phone: currentUser.phone || "",
    address: currentUser.address || "",
  };
}
