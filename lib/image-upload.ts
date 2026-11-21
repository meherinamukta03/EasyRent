const IMGBB_UPLOAD_URL = "https://api.imgbb.com/1/upload";

/**
 * Uploads an image file to ImgBB and returns its public URL.
 *
 * This is the same upload flow used by Add Equipment. Keeping it in one place
 * means the Add and Edit forms share a single image upload implementation.
 */
export async function uploadImageToImgBB(image: File): Promise<string> {
  if (!image || image.size === 0) {
    throw new Error("Please select an image");
  }

  if (!image.type.startsWith("image/")) {
    throw new Error("Please select a valid image file");
  }

  const imageFormData = new FormData();
  imageFormData.append("image", image);

  const response = await fetch(
    `${IMGBB_UPLOAD_URL}?key=${process.env.IMGBB_API_KEY}`,
    {
      method: "POST",
      body: imageFormData,
    }
  );

  const result = await response.json();

  if (!response.ok || !result.success || !result.data?.url) {
    throw new Error("Image upload failed. Please try again.");
  }

  return result.data.url as string;
}
