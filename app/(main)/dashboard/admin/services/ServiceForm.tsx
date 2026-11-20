"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ClockIcon, DollarSignIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { SERVICE_CATEGORIES } from "@/lib/site"
import { uploadImage } from "@/lib/upload-image"
import { createService, updateService } from "@/lib/api-client"
import type {
  Service,
  ServiceInput,
  ServiceStatus,
} from "@/app/components/types/service"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/toast"
import ImageInput, {
  emptyImageValue,
  type ImageValue,
} from "@/app/components/shared/ImageInput"

import { refreshServicesCache } from "./actions"

type FieldName =
  "serviceName" | "category" | "description" | "price" | "duration" | "image"
type Errors = Partial<Record<FieldName, string>>

const DESCRIPTION_MAX = 1000

/** Add / Update Service form (admin only; Express re-checks the role). */
export default function ServiceForm({ service }: { service?: Service }) {
  const router = useRouter()
  const isEdit = !!service

  const [serviceName, setServiceName] = useState(service?.serviceName ?? "")
  const [category, setCategory] = useState(service?.category ?? "")
  const [description, setDescription] = useState(service?.description ?? "")
  const [price, setPrice] = useState(service ? String(service.price) : "")
  const [duration, setDuration] = useState(
    service ? String(service.duration) : ""
  )
  const [status, setStatus] = useState<ServiceStatus>(
    service?.status ?? "active"
  )
  const [image, setImage] = useState<ImageValue>(emptyImageValue)
  const [errors, setErrors] = useState<Errors>({})
  const [phase, setPhase] = useState<"idle" | "uploading" | "saving">("idle")
  const busy = phase !== "idle"

  function clear(name: FieldName) {
    if (errors[name]) setErrors((e) => ({ ...e, [name]: undefined }))
  }

  function validate(): Errors {
    const next: Errors = {}
    const name = serviceName.trim()
    if (name.length < 3)
      next.serviceName = "Service name must be at least 3 characters."
    else if (name.length > 80)
      next.serviceName = "Service name must be 80 characters or fewer."

    if (!(SERVICE_CATEGORIES as readonly string[]).includes(category))
      next.category = "Please choose a category."

    const desc = description.trim()
    if (desc.length < 20)
      next.description = "Description must be at least 20 characters."

    const priceNum = Number(price)
    if (!price.trim() || !Number.isFinite(priceNum) || priceNum <= 0)
      next.price = "Price must be a positive number."
    else if (!/^\d+(\.\d{1,2})?$/.test(price.trim()))
      next.price = "Use at most 2 decimal places, e.g. 45 or 45.50."

    const durationNum = Number(duration)
    if (!duration.trim() || !Number.isInteger(durationNum) || durationNum <= 0)
      next.duration = "Duration must be a positive whole number of minutes."
    else if (durationNum > 720)
      next.duration = "Duration can't be more than 12 hours."

    if (!isEdit && !image.file) next.image = "Please upload a service image."
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

    let imageUrl = service?.image ?? ""
    if (image.file) {
      setPhase("uploading")
      try {
        imageUrl = await uploadImage(image.file)
      } catch (err) {
        setPhase("idle")
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
    }

    const input: ServiceInput = {
      serviceName: serviceName.trim(),
      category,
      description: description.trim(),
      price: Number(price),
      duration: Number(duration),
      image: imageUrl,
      status,
    }

    setPhase("saving")
    try {
      const saved = isEdit
        ? await updateService(service._id, input)
        : await createService(input)
      await refreshServicesCache(saved?._id ?? service?._id).catch(() => {})
      toast.add({
        title: isEdit ? "Service updated" : "Service created",
        description: input.serviceName,
        type: "success",
      })
      router.push("/dashboard/admin/services")
      router.refresh()
    } catch (err) {
      setPhase("idle")
      toast.add({
        title: isEdit ? "Couldn't update service" : "Couldn't create service",
        description: err instanceof Error ? err.message : "Please try again.",
        type: "error",
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="max-w-3xl">
      <div className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
        <FieldGroup>
          <Field data-invalid={!!errors.serviceName || undefined}>
            <FieldLabel htmlFor="serviceName">Service name</FieldLabel>
            <Input
              id="serviceName"
              value={serviceName}
              placeholder="e.g. Signature Haircut & Blow-dry"
              aria-invalid={!!errors.serviceName}
              disabled={busy}
              onChange={(e) => {
                setServiceName(e.target.value)
                clear("serviceName")
              }}
            />
            <FieldError>{errors.serviceName}</FieldError>
          </Field>

          <Field data-invalid={!!errors.category || undefined}>
            <FieldLabel htmlFor="category">Category</FieldLabel>
            <NativeSelect
              id="category"
              className="w-full"
              value={category}
              aria-invalid={!!errors.category}
              disabled={busy}
              onChange={(e) => {
                setCategory(e.target.value)
                clear("category")
              }}
            >
              <NativeSelectOption value="" disabled>
                Select a category
              </NativeSelectOption>
              {SERVICE_CATEGORIES.map((c) => (
                <NativeSelectOption key={c} value={c}>
                  {c}
                </NativeSelectOption>
              ))}
            </NativeSelect>
            <FieldError>{errors.category}</FieldError>
          </Field>

          <Field data-invalid={!!errors.description || undefined}>
            <FieldLabel htmlFor="description">Description</FieldLabel>
            <Textarea
              id="description"
              rows={5}
              value={description}
              placeholder="What's included, who it's for, and what to expect."
              aria-invalid={!!errors.description}
              disabled={busy}
              onChange={(e) => {
                setDescription(e.target.value.slice(0, DESCRIPTION_MAX))
                clear("description")
              }}
            />
            <div className="flex justify-between gap-4">
              <FieldError>{errors.description}</FieldError>
              <p className="ml-auto text-xs text-muted-foreground">
                {description.length}/{DESCRIPTION_MAX}
              </p>
            </div>
          </Field>

          <div className="grid gap-6 sm:grid-cols-2">
            <Field data-invalid={!!errors.price || undefined}>
              <FieldLabel htmlFor="price">Price (USD)</FieldLabel>
              <InputGroup>
                <InputGroupInput
                  id="price"
                  type="number"
                  inputMode="decimal"
                  min="0.01"
                  step="0.01"
                  placeholder="45.00"
                  value={price}
                  aria-invalid={!!errors.price}
                  disabled={busy}
                  onChange={(e) => {
                    setPrice(e.target.value)
                    clear("price")
                  }}
                />
                <InputGroupAddon>
                  <DollarSignIcon />
                </InputGroupAddon>
              </InputGroup>
              <FieldError>{errors.price}</FieldError>
            </Field>

            <Field data-invalid={!!errors.duration || undefined}>
              <FieldLabel htmlFor="duration">
                Estimated duration (minutes)
              </FieldLabel>
              <InputGroup>
                <InputGroupInput
                  id="duration"
                  type="number"
                  inputMode="numeric"
                  min="1"
                  step="1"
                  placeholder="60"
                  value={duration}
                  aria-invalid={!!errors.duration}
                  disabled={busy}
                  onChange={(e) => {
                    setDuration(e.target.value)
                    clear("duration")
                  }}
                />
                <InputGroupAddon>
                  <ClockIcon />
                </InputGroupAddon>
              </InputGroup>
              <FieldError>{errors.duration}</FieldError>
            </Field>
          </div>

          <Field data-invalid={!!errors.image || undefined}>
            <FieldLabel>Service image</FieldLabel>
            <ImageInput
              value={image}
              onChange={(v) => {
                setImage(v)
                clear("image")
              }}
              onError={(message) =>
                setErrors((e) => ({ ...e, image: message ?? undefined }))
              }
              currentImage={service?.image}
              disabled={busy}
              invalid={!!errors.image}
            />
            {isEdit && (
              <FieldDescription>
                Leave empty to keep the current image.
              </FieldDescription>
            )}
            <FieldError>{errors.image}</FieldError>
          </Field>

          <Field>
            <FieldLabel id="status-label">Status</FieldLabel>
            <div
              role="radiogroup"
              aria-labelledby="status-label"
              className="grid gap-3 sm:grid-cols-2"
            >
              {(
                [
                  ["active", "Active", "Visible on the site and bookable"],
                  [
                    "inactive",
                    "Inactive",
                    "Hidden from the site; can't be booked",
                  ],
                ] as const
              ).map(([value, label, hint]) => (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={status === value}
                  disabled={busy}
                  onClick={() => setStatus(value)}
                  className={cn(
                    "rounded-xl border p-3 text-left transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                    status === value
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "hover:border-primary/40"
                  )}
                >
                  <span className="block text-sm font-medium">{label}</span>
                  <span className="block text-xs text-muted-foreground">
                    {hint}
                  </span>
                </button>
              ))}
            </div>
          </Field>
        </FieldGroup>

        <div className="mt-6 flex flex-col-reverse gap-2 border-t pt-5 sm:flex-row sm:justify-end">
          <Button
            variant="ghost"
            render={<Link href="/dashboard/admin/services" />}
            nativeButton={false}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={busy}>
            {busy && <Spinner />}
            {phase === "uploading"
              ? "Uploading image..."
              : phase === "saving"
                ? "Saving..."
                : isEdit
                  ? "Save changes"
                  : "Create service"}
          </Button>
        </div>
      </div>
    </form>
  )
}
