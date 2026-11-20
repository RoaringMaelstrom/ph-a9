"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  CheckIcon,
  CircleIcon,
  EyeIcon,
  EyeOffIcon,
  ImageUpIcon,
  LinkIcon,
  LockIcon,
  MailIcon,
  UserIcon,
  XIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { signIn, signUp } from "@/lib/auth-client"
import { PASSWORD_RULES, passwordError } from "@/lib/password"
import { dashboardPathFor } from "@/lib/routes"
import {
  ACCEPTED_IMAGE_TYPES,
  uploadImage,
  validateImageFile,
} from "@/lib/upload-image"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Spinner } from "@/components/ui/spinner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/toast"
import GoogleIcon from "@/app/components/shared/GoogleIcon"

type Errors = Partial<Record<"name" | "email" | "password" | "image", string>>
type ImageMode = "upload" | "url"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function isHttpUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false
  }
}

function getInitials(name: string) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || <UserIcon className="size-5" />
  )
}

export default function SignUpForm({ redirectTo }: { redirectTo: string | null }) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [imageMode, setImageMode] = useState<ImageMode>("upload")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState("")
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [errors, setErrors] = useState<Errors>({})
  const [status, setStatus] = useState<"idle" | "uploading" | "creating">("idle")
  const [googleLoading, setGoogleLoading] = useState(false)

  const submitting = status !== "idle"
  const busy = submitting || googleLoading

  // Object URL for the local file preview. Replaced/revoked in the handlers;
  // this ref lets us revoke the last one on unmount.
  const previewRef = useRef<string | null>(null)
  useEffect(() => () => {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current)
  }, [])

  function setPreviewFile(file: File | null) {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current)
    previewRef.current = file ? URL.createObjectURL(file) : null
    setImageFile(file)
    setPreviewUrl(previewRef.current)
  }

  const avatarSrc =
    imageMode === "upload"
      ? imageFile
        ? previewUrl
        : null
      : isHttpUrl(imageUrl)
        ? imageUrl
        : null

  function clearError(key: keyof Errors) {
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }))
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = "" // allow re-selecting the same file
    if (!file) return
    const error = validateImageFile(file)
    if (error) {
      setErrors((e) => ({ ...e, image: error }))
      return
    }
    clearError("image")
    setPreviewFile(file)
  }

  function removeFile() {
    setPreviewFile(null)
  }

  function validate(email: string): Errors {
    const next: Errors = {}
    if (!name.trim()) next.name = "Full name is required."
    else if (name.trim().length < 2) next.name = "Name must be at least 2 characters."

    if (!email) next.email = "Email is required."
    else if (!EMAIL_RE.test(email)) next.email = "Enter a valid email address."

    if (!password) next.password = "Password is required."
    else {
      const pwError = passwordError(password)
      if (pwError) next.password = pwError
    }

    if (imageMode === "url" && imageUrl.trim() && !isHttpUrl(imageUrl.trim())) {
      next.image = "Enter a valid image URL starting with http:// or https://."
    }
    return next
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const email = String(new FormData(event.currentTarget).get("email") ?? "").trim()

    const nextErrors = validate(email)
    setErrors(nextErrors)
    if (Object.values(nextErrors).some(Boolean)) {
      toast.add({ title: "Please fix the highlighted fields", type: "error" })
      return
    }

    let image: string | undefined
    if (imageMode === "upload" && imageFile) {
      setStatus("uploading")
      try {
        image = await uploadImage(imageFile)
      } catch (err) {
        setStatus("idle")
        const message = err instanceof Error ? err.message : "Image upload failed."
        setErrors((e) => ({ ...e, image: message }))
        toast.add({ title: "Image upload failed", description: message, type: "error" })
        return
      }
    } else if (imageMode === "url" && imageUrl.trim()) {
      image = imageUrl.trim()
    }

    setStatus("creating")
    const { data, error } = await signUp.email({
      name: name.trim(),
      email,
      password,
      image,
    })

    if (error) {
      setStatus("idle")
      const exists = error.status === 422 || /exist/i.test(error.message ?? "")
      if (exists) setErrors((e) => ({ ...e, email: "An account with this email already exists." }))
      toast.add({
        title: "Sign up failed",
        description: exists
          ? "An account with this email already exists. Try signing in instead."
          : (error.message ?? "Something went wrong. Please try again."),
        type: "error",
      })
      return
    }

    toast.add({
      title: "Account created!",
      description: `Welcome to SalonBook, ${data.user.name.split(" ")[0]}.`,
      type: "success",
    })
    router.replace(redirectTo ?? dashboardPathFor(data.user.role))
    router.refresh()
  }

  async function handleGoogle() {
    setGoogleLoading(true)
    // Return via /sign-in, which redirects signed-in users by role.
    const callbackURL = redirectTo
      ? `/sign-in?redirect=${encodeURIComponent(redirectTo)}`
      : "/sign-in"
    const { error } = await signIn.social({
      provider: "google",
      callbackURL,
      errorCallbackURL: "/sign-in",
    })
    if (error) {
      setGoogleLoading(false)
      toast.add({
        title: "Google sign-up failed",
        description: error.message ?? "Please try again.",
        type: "error",
      })
    }
  }

  const submitLabel =
    status === "uploading"
      ? "Uploading image..."
      : status === "creating"
        ? "Creating account..."
        : "Create Account"

  return (
    <Card className="border-none bg-transparent shadow-none ring-0 sm:border-solid sm:bg-card sm:shadow-sm sm:ring-1">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-semibold tracking-tight">
          Create your account
        </CardTitle>
        <CardDescription>Book salon services and track your appointments</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} noValidate>
          <FieldGroup>
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full"
              onClick={handleGoogle}
              disabled={busy}
            >
              {googleLoading ? <Spinner /> : <GoogleIcon />}
              Continue with Google
            </Button>

            <FieldSeparator>or sign up with email</FieldSeparator>

            {/* Full name */}
            <Field data-invalid={!!errors.name || undefined}>
              <FieldLabel htmlFor="name">Full Name</FieldLabel>
              <InputGroup>
                <InputGroupInput
                  id="name"
                  name="name"
                  autoComplete="name"
                  placeholder="Jane Doe"
                  value={name}
                  aria-invalid={!!errors.name}
                  disabled={busy}
                  onChange={(e) => {
                    setName(e.target.value)
                    clearError("name")
                  }}
                />
                <InputGroupAddon>
                  <UserIcon />
                </InputGroupAddon>
              </InputGroup>
              <FieldError>{errors.name}</FieldError>
            </Field>

            {/* Email */}
            <Field data-invalid={!!errors.email || undefined}>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <InputGroup>
                <InputGroupInput
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  aria-invalid={!!errors.email}
                  disabled={busy}
                  onChange={() => clearError("email")}
                />
                <InputGroupAddon>
                  <MailIcon />
                </InputGroupAddon>
              </InputGroup>
              <FieldError>{errors.email}</FieldError>
            </Field>

            {/* Password */}
            <Field data-invalid={!!errors.password || undefined}>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <InputGroup>
                <InputGroupInput
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Create a password"
                  value={password}
                  aria-invalid={!!errors.password}
                  aria-describedby="password-rules"
                  disabled={busy}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    clearError("password")
                  }}
                />
                <InputGroupAddon>
                  <LockIcon />
                </InputGroupAddon>
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    size="icon-xs"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
              <ul id="password-rules" className="grid gap-1 text-xs sm:grid-cols-3">
                {PASSWORD_RULES.map((rule) => {
                  const met = rule.test(password)
                  return (
                    <li
                      key={rule.id}
                      className={cn(
                        "flex items-center gap-1.5 text-muted-foreground transition-colors",
                        met && "text-success"
                      )}
                    >
                      {met ? (
                        <CheckIcon className="size-3.5" />
                      ) : (
                        <CircleIcon className="size-2.5" />
                      )}
                      {rule.label}
                    </li>
                  )
                })}
              </ul>
              <FieldError>{errors.password}</FieldError>
            </Field>

            {/* Profile image */}
            <Field data-invalid={!!errors.image || undefined}>
              <FieldLabel>
                Profile Image <span className="font-normal text-muted-foreground">(optional)</span>
              </FieldLabel>
              <div className="flex items-start gap-4">
                <Avatar className="size-16 shrink-0">
                  {avatarSrc && (
                    <AvatarImage src={avatarSrc} alt="Profile preview" className="object-cover" />
                  )}
                  <AvatarFallback className="text-base">{getInitials(name)}</AvatarFallback>
                </Avatar>

                <Tabs
                  value={imageMode}
                  onValueChange={(value) => {
                    setImageMode(value as ImageMode)
                    clearError("image")
                  }}
                  className="min-w-0 flex-1"
                >
                  <TabsList className="w-full">
                    <TabsTrigger value="upload" disabled={busy}>
                      <ImageUpIcon />
                      Upload
                    </TabsTrigger>
                    <TabsTrigger value="url" disabled={busy}>
                      <LinkIcon />
                      Image URL
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="upload">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept={ACCEPTED_IMAGE_TYPES}
                      className="sr-only"
                      tabIndex={-1}
                      onChange={handleFileChange}
                    />
                    {imageFile ? (
                      <div className="flex items-center gap-2 rounded-md border px-3 py-2">
                        <span className="min-w-0 flex-1 truncate text-sm">{imageFile.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          aria-label="Remove image"
                          onClick={removeFile}
                          disabled={busy}
                        >
                          <XIcon />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full border-dashed"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={busy}
                      >
                        <ImageUpIcon />
                        Choose an image
                      </Button>
                    )}
                    <FieldDescription className="mt-1.5 text-xs">
                      JPG, PNG, WEBP or GIF, up to 5 MB.
                    </FieldDescription>
                  </TabsContent>

                  <TabsContent value="url">
                    <InputGroup>
                      <InputGroupInput
                        type="url"
                        inputMode="url"
                        placeholder="https://example.com/photo.jpg"
                        value={imageUrl}
                        aria-invalid={!!errors.image}
                        aria-label="Profile image URL"
                        disabled={busy}
                        onChange={(e) => {
                          setImageUrl(e.target.value)
                          clearError("image")
                        }}
                      />
                      <InputGroupAddon>
                        <LinkIcon />
                      </InputGroupAddon>
                    </InputGroup>
                  </TabsContent>
                </Tabs>
              </div>
              <FieldError>{errors.image}</FieldError>
            </Field>

            <Button type="submit" size="lg" className="w-full" disabled={busy}>
              {submitting && <Spinner />}
              {submitLabel}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>

      <CardFooter className="justify-center border-none bg-transparent text-sm text-muted-foreground">
        Already have an account?
        <Link
          href={redirectTo ? `/sign-in?redirect=${encodeURIComponent(redirectTo)}` : "/sign-in"}
          className="ml-1 font-medium text-primary underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </CardFooter>
    </Card>
  )
}
