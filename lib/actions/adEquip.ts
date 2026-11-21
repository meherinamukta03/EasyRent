
"use server";

import { uploadImageToImgBB } from "@/lib/image-upload";

export async function AddEquip(formData: FormData) {
  try {
    // 1. Get image from FormData
    const image = formData.get("image");

    if (!(image instanceof File) || image.size === 0) {
      throw new Error("Please select an image");
    }

    // 2. Upload image using the shared ImgBB upload helper
    const imageUrl = await uploadImageToImgBB(image);

    // 3. Convert FormData entries into object (excluding the raw image file)
    const formValues = Object.fromEntries(formData.entries());
    delete formValues.image;

    // 4. Prepare equipment data
    const equipmentData = {
      ...formValues,
      rentalPrice: Number(formValues.rentalPrice),
      quantity: Number(formValues.quantity),
      image: imageUrl,
      ownerInfo: JSON.parse(formValues.ownerInfo as string),
      status: "Pending",
    };

    // 5. Send data to backend
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/equipments`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(equipmentData),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to add equipment");
    }

    return result;

  } catch (error) {
    console.error("Add Equipment Error:", error);

    throw new Error(
      error instanceof Error
        ? error.message
        : "Something went wrong"
    );
  }
}
