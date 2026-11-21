/*
 * Browser-side upload helpers. They only talk to our own `/api/upload`
 * route; the ImgBB key never reaches the browser (see lib/imgbb.ts).
 */

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024
export const ACCEPTED_IMAGE_TYPES = "image/jpeg,image/png,image/webp,image/gif"

/**
 * What an upload is for. The server checks it against the caller's role:
 * `profile` = the signed-in user's own photo, `service` = admin only.
 */
export const UPLOAD_PURPOSES = ["profile", "service"] as const
export type UploadPurpose = (typeof UPLOAD_PURPOSES)[number]

/** Client-side check before uploading. Returns an error message or null. */
export function validateImageFile(file: File) {
  if (!ACCEPTED_IMAGE_TYPES.split(",").includes(file.type)) {
    return "Only JPG, PNG, WEBP or GIF images are allowed."
  }
  if (file.size > MAX_IMAGE_BYTES) return "Image must be 5 MB or smaller."
  return null
}

/**
 * Uploads an image through `/api/upload` and returns its ImgBB URL.
 * Requires a signed-in session (the route rejects anonymous uploads).
 */
export async function uploadImage(
  file: File,
  purpose: UploadPurpose
): Promise<string> {
  const body = new FormData()
  body.append("image", file)
  body.append("purpose", purpose)

  const res = await fetch("/api/upload", {
    method: "POST",
    body,
    credentials: "same-origin",
  })
  const json = await res.json().catch(() => null)

  if (!res.ok || typeof json?.url !== "string") {
    throw new Error(json?.message ?? "Image upload failed. Please try again.")
  }
  return json.url
}
