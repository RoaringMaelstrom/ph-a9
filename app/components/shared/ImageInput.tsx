"use client"

import { useEffect, useRef, useState } from "react"
import { ImageUpIcon, LinkIcon, XIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { ACCEPTED_IMAGE_TYPES, validateImageFile } from "@/lib/upload-image"
import { Button } from "@/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export interface ImageValue {
  mode: "upload" | "url"
  file: File | null
  url: string
}

export const emptyImageValue: ImageValue = {
  mode: "upload",
  file: null,
  url: "",
}

export function isHttpUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false
  }
}

/**
 * Image picker with live preview. `allowUrl` adds an "Image URL" tab
 * (profiles); without it only file upload is offered (services).
 * The parent uploads `value.file` on submit (see lib/upload-image.ts).
 */
export default function ImageInput({
  value,
  onChange,
  onError,
  currentImage,
  allowUrl = false,
  disabled = false,
  invalid = false,
  shape = "rect",
  fallback,
}: {
  value: ImageValue
  onChange: (value: ImageValue) => void
  /** Called with a message when a chosen file is rejected */
  onError: (message: string | null) => void
  /** Existing image shown until a new one is picked */
  currentImage?: string | null
  allowUrl?: boolean
  disabled?: boolean
  invalid?: boolean
  shape?: "rect" | "circle"
  /** Shown in the preview when there's no image */
  fallback?: React.ReactNode
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const previewRef = useRef<string | null>(null)

  useEffect(
    () => () => {
      if (previewRef.current) URL.revokeObjectURL(previewRef.current)
    },
    []
  )

  function setFile(file: File | null) {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current)
    previewRef.current = file ? URL.createObjectURL(file) : null
    setPreview(previewRef.current)
    onChange({ ...value, file })
  }

  function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return
    const error = validateImageFile(file)
    onError(error)
    if (!error) setFile(file)
  }

  const shownImage =
    value.mode === "upload"
      ? (preview ?? currentImage)
      : isHttpUrl(value.url)
        ? value.url
        : currentImage

  const uploadPanel = (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES}
        className="sr-only"
        tabIndex={-1}
        onChange={handleFile}
      />
      {value.file ? (
        <div className="flex items-center gap-2 rounded-md border bg-background px-3 py-2">
          <span className="min-w-0 flex-1 truncate text-sm">
            {value.file.name}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label="Remove selected image"
            onClick={() => setFile(null)}
            disabled={disabled}
          >
            <XIcon />
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          className={cn(
            "w-full border-dashed",
            invalid && "border-destructive"
          )}
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
        >
          <ImageUpIcon />
          {currentImage ? "Choose a new image" : "Choose an image"}
        </Button>
      )}
      <p className="mt-1.5 text-xs text-muted-foreground">
        JPG, PNG, WEBP or GIF, up to 5 MB.
      </p>
    </>
  )

  return (
    <div
      className={cn(
        "flex gap-4",
        shape === "circle"
          ? "items-start"
          : "flex-col sm:flex-row sm:items-start"
      )}
    >
      <div
        className={cn(
          "relative shrink-0 overflow-hidden border bg-muted",
          shape === "circle"
            ? "size-20 rounded-full"
            : "aspect-4/3 w-full rounded-xl sm:w-48"
        )}
      >
        {shownImage ? (
          // eslint-disable-next-line @next/next/no-img-element -- local blob/arbitrary URL preview
          <img
            src={shownImage}
            alt="Preview"
            className="size-full object-cover"
          />
        ) : (
          <span className="flex size-full items-center justify-center text-muted-foreground">
            {fallback ?? <ImageUpIcon className="size-6" />}
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        {allowUrl ? (
          <Tabs
            value={value.mode}
            onValueChange={(mode) => {
              onError(null)
              onChange({ ...value, mode: mode as ImageValue["mode"] })
            }}
          >
            <TabsList className="w-full">
              <TabsTrigger value="upload" disabled={disabled}>
                <ImageUpIcon />
                Upload
              </TabsTrigger>
              <TabsTrigger value="url" disabled={disabled}>
                <LinkIcon />
                Image URL
              </TabsTrigger>
            </TabsList>
            <TabsContent value="upload">{uploadPanel}</TabsContent>
            <TabsContent value="url">
              <InputGroup>
                <InputGroupInput
                  type="url"
                  inputMode="url"
                  placeholder="https://example.com/photo.jpg"
                  value={value.url}
                  aria-label="Image URL"
                  aria-invalid={invalid}
                  disabled={disabled}
                  onChange={(e) => {
                    onError(null)
                    onChange({ ...value, url: e.target.value })
                  }}
                />
                <InputGroupAddon>
                  <LinkIcon />
                </InputGroupAddon>
              </InputGroup>
            </TabsContent>
          </Tabs>
        ) : (
          uploadPanel
        )}
      </div>
    </div>
  )
}
