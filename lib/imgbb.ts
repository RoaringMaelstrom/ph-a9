import "server-only"

/**
 * ImgBB upload, server-side only. `import "server-only"` makes the build fail
 * if a Client Component ever imports this file, and the API key is read
 * from the environment only inside `uploadToImgbb`, at the moment of an
 * upload. It is never returned, logged or sent anywhere except ImgBB.
 *
 * Only `app/api/upload/route.ts` calls this, after checking the session.
 */

const IMGBB_ENDPOINT = "https://api.imgbb.com/1/upload"
const TIMEOUT_MS = 20_000

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024 // 5 MB

export class ImageUploadError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message)
  }
}

/**
 * Checks the file's first bytes (its real type), not the browser-supplied
 * MIME type, which anyone can fake. Returns the detected type or null.
 */
function sniffImageType(bytes: Uint8Array): string | null {
  const starts = (...sig: number[]) => sig.every((b, i) => bytes[i] === b)
  if (starts(0xff, 0xd8, 0xff)) return "image/jpeg"
  if (starts(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)) return "image/png"
  if (starts(0x47, 0x49, 0x46, 0x38)) return "image/gif" // "GIF8"
  if (
    starts(0x52, 0x49, 0x46, 0x46) && // "RIFF"
    bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50 // "WEBP"
  ) {
    return "image/webp"
  }
  return null
}

/** Validates the file and uploads it to ImgBB. Returns the public image URL. */
export async function uploadToImgbb(file: File): Promise<string> {
  if (file.size === 0) {
    throw new ImageUploadError("Please choose an image to upload.", 400)
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new ImageUploadError("Image must be 5 MB or smaller.", 413)
  }

  const bytes = new Uint8Array(await file.arrayBuffer())
  const type = sniffImageType(bytes)
  if (!type) {
    throw new ImageUploadError("Only JPG, PNG, WEBP or GIF images are allowed.", 415)
  }

  const apiKey = process.env.IMGBB_API_KEY
  if (!apiKey) {
    console.error("[upload] IMGBB_API_KEY is not set")
    throw new ImageUploadError("Image upload is unavailable right now.", 503)
  }

  const body = new FormData()
  // Re-wrap the verified bytes, so ImgBB gets exactly what we checked.
  body.append("image", new Blob([bytes], { type }), "upload")

  let res: Response
  try {
    // No `expiration`: profile and service photos must not disappear.
    res = await fetch(`${IMGBB_ENDPOINT}?key=${encodeURIComponent(apiKey)}`, {
      method: "POST",
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
  } catch {
    throw new ImageUploadError("Could not reach the image host. Please try again.", 502)
  }

  const json = await res.json().catch(() => null)
  const url: unknown = json?.data?.display_url ?? json?.data?.url

  if (!res.ok || typeof url !== "string" || !url.startsWith("https://i.ibb.co/")) {
    // Log ImgBB's own error (never the key) so failures can be diagnosed.
    console.error("[upload] ImgBB rejected the upload:", res.status, json?.error?.code, json?.error?.message)
    throw new ImageUploadError("Image upload failed. Please try again.", 502)
  }
  return url
}
