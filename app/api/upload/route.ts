import { NextResponse, type NextRequest } from "next/server"

import { getCurrentSession } from "@/lib/session"
import { ImageUploadError, MAX_UPLOAD_BYTES, uploadToImgbb } from "@/lib/imgbb"
import { UPLOAD_PURPOSES, type UploadPurpose } from "@/lib/upload-image"

/**
 * POST /api/upload: the only way to reach ImgBB. The API key stays on the
 * server (lib/imgbb.ts). An upload is accepted only when all of these hold:
 *
 * 1. The request comes from this site (same-origin), not another website or script.
 * 2. The caller is signed in and not blocked (session read from the DB).
 * 3. The purpose is allowed for their role: `profile` (their own profile
 *    photo, any user) or `service` (service images, admins only).
 * 4. They are under the rate limit.
 * 5. The file really is a JPG/PNG/WEBP/GIF of at most 5 MB (lib/imgbb.ts).
 *
 * Sign-up creates the account first and then uploads the photo with the new
 * session, so there are no anonymous uploads.
 * Body: multipart/form-data with `image` (file) and `purpose`. Returns `{ url }`.
 */

const RATE_LIMIT = 10 // uploads…
const RATE_WINDOW_MS = 10 * 60 * 1000 // …per user per 10 minutes

/*
 * In-memory, so it's per server instance (on serverless hosting each instance
 * counts separately). It's a cheap brake on abuse; auth is the real gate.
 */
const recentUploads = new Map<string, number[]>()

function isRateLimited(userId: string) {
  const now = Date.now()
  const recent = (recentUploads.get(userId) ?? []).filter(
    (t) => now - t < RATE_WINDOW_MS
  )
  const limited = recent.length >= RATE_LIMIT
  if (!limited) recent.push(now)
  recentUploads.set(userId, recent)
  return limited
}

function fail(message: string, status: number) {
  return NextResponse.json(
    { message },
    { status, headers: { "Cache-Control": "no-store" } }
  )
}

/** Browsers always send these on cross-site requests, so another site can't pass. */
function isSameOrigin(request: NextRequest) {
  const fetchSite = request.headers.get("sec-fetch-site")
  if (fetchSite && fetchSite !== "same-origin") return false
  const origin = request.headers.get("origin")
  return origin === request.nextUrl.origin
}

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return fail("Uploads are only allowed from this site.", 403)
  }

  const session = await getCurrentSession()
  if (!session) {
    return fail("Please sign in to upload an image.", 401)
  }
  const { user } = session
  if (user.isBlocked) {
    return fail("Your account is blocked.", 403)
  }

  // Reject oversized bodies before reading them into memory.
  const length = Number(request.headers.get("content-length") ?? 0)
  if (length > MAX_UPLOAD_BYTES + 64 * 1024) {
    return fail("Image must be 5 MB or smaller.", 413)
  }

  let form: FormData
  try {
    form = await request.formData()
  } catch {
    return fail("Invalid upload request.", 400)
  }

  const purpose = form.get("purpose")
  if (!UPLOAD_PURPOSES.includes(purpose as UploadPurpose)) {
    return fail("Invalid upload request.", 400)
  }
  if (purpose === "service" && user.role !== "admin") {
    return fail("Only admins can upload service images.", 403)
  }

  const file = form.get("image")
  if (!(file instanceof File)) {
    return fail("Please choose an image to upload.", 400)
  }

  if (isRateLimited(user.id)) {
    return fail("Too many uploads. Please wait a few minutes and try again.", 429)
  }

  try {
    const url = await uploadToImgbb(file)
    return NextResponse.json(
      { url },
      { headers: { "Cache-Control": "no-store" } }
    )
  } catch (err) {
    if (err instanceof ImageUploadError) return fail(err.message, err.status)
    console.error("[upload] unexpected error", err)
    return fail("Image upload failed. Please try again.", 500)
  }
}
