"use server"

import { backendFetch } from "@/lib/backend"
import { requireRole } from "@/lib/auth-server"
import { uploadImageToImgBB } from "@/lib/image-upload"

export async function AddEquip(formData: FormData) {
  try {
    await requireRole("owner")

    const image = formData.get("image")

    if (!(image instanceof File) || image.size === 0) {
      throw new Error("Please select an image")
    }

    const imageUrl = await uploadImageToImgBB(image)
    const formValues = Object.fromEntries(formData.entries())
    delete formValues.image

    const ownerInfo =
      typeof formValues.ownerInfo === "string"
        ? JSON.parse(formValues.ownerInfo)
        : undefined

    delete formValues.ownerInfo

    const equipmentData = {
      ...formValues,
      rentalPrice: Number(formValues.rentalPrice),
      quantity: Number(formValues.quantity),
      image: imageUrl,
      // Identity/approval come from the verified JWT and the server; never
      // from a client-supplied ownerInfo object.
      ...(ownerInfo?.name ? { ownerName: String(ownerInfo.name) } : {}),
      status: "Pending",
    }

    return await backendFetch("/equipments", {
      method: "POST",
      body: equipmentData,
    })
  } catch (error) {
    console.error("Add Equipment Error:", error)

    throw new Error(
      error instanceof Error ? error.message : "Something went wrong"
    )
  }
}
