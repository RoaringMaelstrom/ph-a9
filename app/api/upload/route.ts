import { NextResponse } from "next/server"

const MAX_BYTES = 5 * 1024 * 1024 // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]

/**
 * Proxies an image upload to ImgBB so the API key never reaches the browser.
 * Body: multipart/form-data with an `image` file. Returns `{ url }`.
 */
export async function POST(request: Request) {
  const apiKey = process.env.IMGBB_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { message: "Image upload is not configured on the server." },
      { status: 500 }
    )
  }

  let file: FormDataEntryValue | null
  try {
    file = (await request.formData()).get("image")
  } catch {
    return NextResponse.json({ message: "Invalid upload request." }, { status: 400 })
  }

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ message: "Please choose an image to upload." }, { status: 400 })
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { message: "Only JPG, PNG, WEBP or GIF images are allowed." },
      { status: 415 }
    )
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ message: "Image must be 5 MB or smaller." }, { status: 413 })
  }

  const body = new FormData()
  body.append("image", file)

  try {
    const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: "POST",
      body,
    })
    const json = await res.json().catch(() => null)
    const url: string | undefined = json?.data?.display_url ?? json?.data?.url

    if (!res.ok || !url) {
      return NextResponse.json(
        { message: json?.error?.message ?? "Image upload failed. Please try again." },
        { status: 502 }
      )
    }
    return NextResponse.json({ url })
  } catch {
    return NextResponse.json(
      { message: "Could not reach the image host. Please try again." },
      { status: 502 }
    )
  }
}
