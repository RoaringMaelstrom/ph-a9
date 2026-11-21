"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { EyeIcon, EyeOffIcon, LockIcon, MailIcon } from "lucide-react"

import { signIn } from "@/lib/auth-client"
import { dashboardPathFor } from "@/lib/routes"
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
import { toast } from "@/components/ui/toast"
import GoogleIcon from "@/app/components/shared/GoogleIcon"

type Errors = { email?: string; password?: string }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate(email: string, password: string): Errors {
  const errors: Errors = {}
  if (!email) errors.email = "Email is required."
  else if (!EMAIL_RE.test(email)) errors.email = "Enter a valid email address."
  if (!password) errors.password = "Password is required."
  return errors
}

export default function SignInForm({
  redirectTo,
  oauthError,
}: {
  redirectTo: string | null
  oauthError: string | null
}) {
  const router = useRouter()
  const [errors, setErrors] = useState<Errors>({})
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const busy = submitting || googleLoading

  // Surface errors Better Auth sends back from the Google OAuth redirect once.
  const shownOauthError = useRef(false)
  useEffect(() => {
    if (!oauthError || shownOauthError.current) return
    shownOauthError.current = true
    toast.add({
      title: "Google sign-in failed",
      description: oauthError.replaceAll("_", " "),
      type: "error",
    })
  }, [oauthError])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const email = String(form.get("email") ?? "").trim()
    const password = String(form.get("password") ?? "")

    const nextErrors = validate(email, password)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    setSubmitting(true)
    const { data, error } = await signIn.email({ email, password })

    if (error) {
      setSubmitting(false)
      toast.add({
        title: "Sign in failed",
        description:
          error.status === 401
            ? "Incorrect email or password."
            : (error.message ?? "Something went wrong. Please try again."),
        type: "error",
      })
      return
    }

    toast.add({
      title: `Welcome back, ${data.user.name.split(" ")[0]}!`,
      type: "success",
    })
    router.replace(redirectTo ?? dashboardPathFor(data.user.role))
    router.refresh()
  }

  async function handleGoogle() {
    setGoogleLoading(true)
    // Come back to this page: once the session exists, the server component
    // redirects to `redirect` or the user's role dashboard.
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
        title: "Google sign-in failed",
        description: error.message ?? "Please try again.",
        type: "error",
      })
    }
  }

  return (
    <Card className="border-none bg-transparent shadow-none ring-0 sm:border-solid sm:bg-card sm:shadow-sm sm:ring-1">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-semibold tracking-tight">
          <h1>Welcome back</h1>
        </CardTitle>
        <CardDescription>
          Sign in to book and manage your salon appointments
        </CardDescription>
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

            <FieldSeparator>or sign in with email</FieldSeparator>

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
                  onChange={() => errors.email && setErrors((e) => ({ ...e, email: undefined }))}
                />
                <InputGroupAddon>
                  <MailIcon />
                </InputGroupAddon>
              </InputGroup>
              <FieldError>{errors.email}</FieldError>
            </Field>

            <Field data-invalid={!!errors.password || undefined}>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <InputGroup>
                <InputGroupInput
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  aria-invalid={!!errors.password}
                  disabled={busy}
                  onChange={() =>
                    errors.password && setErrors((e) => ({ ...e, password: undefined }))
                  }
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
              <FieldError>{errors.password}</FieldError>
            </Field>

            <Button type="submit" size="lg" className="w-full" disabled={busy}>
              {submitting && <Spinner />}
              {submitting ? "Signing in..." : "Sign In"}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>

      <CardFooter className="justify-center border-none bg-transparent text-sm text-muted-foreground">
        Don&apos;t have an account?
        <Link
          href={redirectTo ? `/sign-up?redirect=${encodeURIComponent(redirectTo)}` : "/sign-up"}
          className="ml-1 font-medium text-primary underline-offset-4 hover:underline"
        >
          Sign up
        </Link>
      </CardFooter>
    </Card>
  )
}
