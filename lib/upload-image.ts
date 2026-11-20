export const MAX_IMAGE_BYTES = 5 * 1024 * 1024
export const ACCEPTED_IMAGE_TYPES = "image/jpeg,image/png,image/webp,image/gif"

/** Client-side check before uploading. Returns an error message or null. */
export function validateImageFile(file: File) {
  if (!ACCEPTED_IMAGE_TYPES.split(",").includes(file.type)) {
    return "Only JPG, PNG, WEBP or GIF images are allowed."
  }
  if (file.size > MAX_IMAGE_BYTES) return "Image must be 5 MB or smaller."
  return null
}

/** Uploads an image through our `/api/upload` route (ImgBB) and returns its URL. */
export async function uploadImage(file: File): Promise<string> {
  const body = new FormData()
  body.append("image", file)

  const res = await fetch("/api/upload", { method: "POST", body })
  const json = await res.json().catch(() => null)

  if (!res.ok || !json?.url) {
    throw new Error(json?.message ?? "Image upload failed. Please try again.")
  }
  return json.url as string
}
