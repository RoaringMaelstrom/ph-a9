"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { MailIcon, PhoneIcon, ShieldCheckIcon, UserIcon } from "lucide-react"

import { updateUser } from "@/lib/auth-client"
import { uploadImage } from "@/lib/upload-image"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "@/components/ui/toast"
import ImageInput, {
  emptyImageValue,
  isHttpUrl,
  type ImageValue,
} from "@/app/components/shared/ImageInput"

import { initials } from "./UserAvatar"

type ProfileUser = {
  name: string
  email: string
  image?: string | null
  phone?: string | null
  role: string
}

type Errors = Partial<Record<"name" | "phone" | "image", string>>

const PHONE_RE = /^\+?[\d\s().-]{7,20}$/

/**
 * Lets the signed-in user edit their own name, photo and phone via Better Auth
 * `updateUser`, which only ever updates the current session's user. `role` and
 * `isBlocked` are `input: false` on the server, so they can't be changed here.
 */
export default function ProfileForm({ user }: { user: ProfileUser }) {
  const router = useRouter()
  const [name, setName] = useState(user.name)
  const [phone, setPhone] = useState(user.phone ?? "")
  const [image, setImage] = useState<ImageValue>(emptyImageValue)
  const [errors, setErrors] = useState<Errors>({})
  const [status, setStatus] = useState<"idle" | "uploading" | "saving">("idle")
  const busy = status !== "idle"

  const dirty =
    name.trim() !== user.name ||
    phone.trim() !== (user.phone ?? "") ||
    (image.mode === "upload" ? !!image.file : !!image.url.trim())

  function validate(): Errors {
    const next: Errors = {}
    const trimmed = name.trim()
    if (!trimmed) next.name = "Name is required."
    else if (trimmed.length < 2)
      next.name = "Name must be at least 2 characters."
    else if (trimmed.length > 60)
      next.name = "Name must be 60 characters or fewer."
    if (phone.trim() && !PHONE_RE.test(phone.trim()))
      next.phone = "Enter a valid phone number, e.g. +1 555 014 2290."
    if (
      image.mode === "url" &&
      image.url.trim() &&
      !isHttpUrl(image.url.trim())
    )
      next.image = "Enter a valid image URL starting with http:// or https://."
    return next
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const next = validate()
    setErrors(next)
    if (Object.values(next).some(Boolean)) {
      toast.add({ title: "Please fix the highlighted fields", type: "error" })
      return
    }

    let newImage: string | undefined
    if (image.mode === "upload" && image.file) {
      setStatus("uploading")
      try {
        newImage = await uploadImage(image.file)
      } catch (err) {
        setStatus("idle")
        const message =
          err instanceof Error ? err.message : "Image upload failed."
        setErrors((e) => ({ ...e, image: message }))
        toast.add({
          title: "Image upload failed",
          description: message,
          type: "error",
        })
        return
      }
    } else if (image.mode === "url" && image.url.trim()) {
      newImage = image.url.trim()
    }

    setStatus("saving")
    const { error } = await updateUser({
      name: name.trim(),
      phone: phone.trim(),
      ...(newImage && { image: newImage }),
    })
    setStatus("idle")

    if (error) {
      toast.add({
        title: "Profile update failed",
        description: error.message ?? "Please try again.",
        type: "error",
      })
      return
    }

    setImage(emptyImageValue)
    toast.add({ title: "Profile updated", type: "success" })
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="max-w-2xl">
      <div className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
        <FieldGroup>
          <Field data-invalid={!!errors.image || undefined}>
            <FieldLabel>Profile photo</FieldLabel>
            <ImageInput
              value={image}
              onChange={setImage}
              onError={(message) =>
                setErrors((e) => ({ ...e, image: message ?? undefined }))
              }
              currentImage={user.image}
              allowUrl
              shape="circle"
              disabled={busy}
              invalid={!!errors.image}
              fallback={
                <span className="text-lg font-medium">{initials(name)}</span>
              }
            />
            <FieldError>{errors.image}</FieldError>
          </Field>

          <Field data-invalid={!!errors.name || undefined}>
            <FieldLabel htmlFor="profile-name">Full name</FieldLabel>
            <InputGroup>
              <InputGroupInput
                id="profile-name"
                autoComplete="name"
                value={name}
                aria-invalid={!!errors.name}
                disabled={busy}
                onChange={(e) => {
                  setName(e.target.value)
                  setErrors((er) => ({ ...er, name: undefined }))
                }}
              />
              <InputGroupAddon>
                <UserIcon />
              </InputGroupAddon>
            </InputGroup>
            <FieldError>{errors.name}</FieldError>
          </Field>

          <Field data-invalid={!!errors.phone || undefined}>
            <FieldLabel htmlFor="profile-phone">
              Phone{" "}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
            </FieldLabel>
            <InputGroup>
              <InputGroupInput
                id="profile-phone"
                type="tel"
                autoComplete="tel"
                placeholder="+1 555 014 2290"
                value={phone}
                aria-invalid={!!errors.phone}
                disabled={busy}
                onChange={(e) => {
                  setPhone(e.target.value)
                  setErrors((er) => ({ ...er, phone: undefined }))
                }}
              />
              <InputGroupAddon>
                <PhoneIcon />
              </InputGroupAddon>
            </InputGroup>
            <FieldError>{errors.phone}</FieldError>
          </Field>

          <Field>
            <FieldLabel htmlFor="profile-email">Email</FieldLabel>
            <InputGroup>
              <InputGroupInput
                id="profile-email"
                value={user.email}
                readOnly
                disabled
              />
              <InputGroupAddon>
                <MailIcon />
              </InputGroupAddon>
            </InputGroup>
            <FieldDescription>
              Your sign-in email can&apos;t be changed here.
            </FieldDescription>
          </Field>

          <Field>
            <FieldLabel>Account type</FieldLabel>
            <p className="inline-flex w-fit items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground">
              <ShieldCheckIcon className="size-3.5" />
              {user.role === "admin" ? "Administrator" : "Customer"}
            </p>
            <FieldDescription>
              Account type is managed by the salon.
            </FieldDescription>
          </Field>
        </FieldGroup>

        <div className="mt-6 flex flex-col-reverse gap-2 border-t pt-5 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="ghost"
            disabled={busy || !dirty}
            onClick={() => {
              setName(user.name)
              setPhone(user.phone ?? "")
              setImage(emptyImageValue)
              setErrors({})
            }}
          >
            Reset
          </Button>
          <Button type="submit" disabled={busy || !dirty}>
            {busy && <Spinner />}
            {status === "uploading"
              ? "Uploading photo..."
              : status === "saving"
                ? "Saving..."
                : "Save changes"}
          </Button>
        </div>
      </div>
    </form>
  )
}
