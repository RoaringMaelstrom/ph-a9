"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  CheckIcon,
  CircleIcon,
  EyeIcon,
  EyeOffIcon,
  KeyRoundIcon,
  LockIcon,
} from "lucide-react"

import { changePassword } from "@/lib/auth-client"
import { PASSWORD_RULES, passwordError } from "@/lib/password"
import { cn } from "@/lib/utils"
import { setAccountPassword } from "@/app/(main)/dashboard/password-actions"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "@/components/ui/toast"

type Errors = Partial<Record<"current" | "next" | "confirm", string>>

/**
 * Password card on the profile page.
 * - Email/password accounts: change it (current password required).
 * - Google-only accounts: add a password so they can also sign in by email.
 * Both enforce the sign-up password rules on the server as well.
 */
export default function PasswordForm({ hasPassword }: { hasPassword: boolean }) {
  const router = useRouter()
  const [current, setCurrent] = useState("")
  const [next, setNext] = useState("")
  const [confirm, setConfirm] = useState("")
  const [revokeOthers, setRevokeOthers] = useState(true)
  const [show, setShow] = useState(false)
  const [errors, setErrors] = useState<Errors>({})
  const [saving, setSaving] = useState(false)

  const dirty = !!(current || next || confirm)

  function reset() {
    setCurrent("")
    setNext("")
    setConfirm("")
    setErrors({})
  }

  function validate(): Errors {
    const e: Errors = {}
    if (hasPassword && !current) e.current = "Enter your current password."
    e.next = next ? (passwordError(next) ?? undefined) : "Enter a new password."
    if (!e.next && hasPassword && next === current) {
      e.next = "Choose a password different from your current one."
    }
    if (!confirm) e.confirm = "Confirm your new password."
    else if (confirm !== next) e.confirm = "Passwords don't match."
    return e
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const found = validate()
    setErrors(found)
    if (Object.values(found).some(Boolean)) {
      toast.add({ title: "Please fix the highlighted fields", type: "error" })
      return
    }

    setSaving(true)
    let error: string | null = null
    if (hasPassword) {
      const result = await changePassword({
        currentPassword: current,
        newPassword: next,
        revokeOtherSessions: revokeOthers,
      })
      if (result.error) {
        error =
          result.error.code === "INVALID_PASSWORD"
            ? "Your current password is incorrect."
            : (result.error.message ?? "We couldn't change your password.")
        if (result.error.code === "INVALID_PASSWORD") {
          setErrors({ current: error })
        }
      }
    } else {
      error = (await setAccountPassword(next)).error
    }
    setSaving(false)

    if (error) {
      toast.add({
        title: hasPassword
          ? "Password not changed"
          : "Password not set",
        description: error,
        type: "error",
      })
      return
    }

    reset()
    toast.add({
      title: hasPassword ? "Password changed" : "Password added",
      description: hasPassword
        ? revokeOthers
          ? "You've been signed out on your other devices."
          : undefined
        : "You can now also sign in with your email and this password.",
      type: "success",
    })
    // A newly added password switches this card to "Change password".
    router.refresh()
  }

  const inputType = show ? "text" : "password"
  const toggle = (
    <InputGroupAddon align="inline-end">
      <InputGroupButton
        size="icon-xs"
        aria-label={show ? "Hide passwords" : "Show passwords"}
        onClick={() => setShow((v) => !v)}
      >
        {show ? <EyeOffIcon /> : <EyeIcon />}
      </InputGroupButton>
    </InputGroupAddon>
  )

  return (
    <form onSubmit={handleSubmit} noValidate className="mt-6 max-w-2xl">
      <div className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
        <div className="mb-5">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <KeyRoundIcon className="size-4.5 text-primary" />
            {hasPassword ? "Change password" : "Set a password"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {hasPassword
              ? "Enter your current password, then choose a new one."
              : "You signed up with Google. Add a password to also sign in with your email address."}
          </p>
        </div>

        <FieldGroup>
          {hasPassword && (
            <Field data-invalid={!!errors.current || undefined}>
              <FieldLabel htmlFor="current-password">
                Current password
              </FieldLabel>
              <InputGroup>
                <InputGroupInput
                  id="current-password"
                  type={inputType}
                  autoComplete="current-password"
                  value={current}
                  aria-invalid={!!errors.current}
                  disabled={saving}
                  onChange={(e) => {
                    setCurrent(e.target.value)
                    setErrors((er) => ({ ...er, current: undefined }))
                  }}
                />
                <InputGroupAddon>
                  <LockIcon />
                </InputGroupAddon>
                {toggle}
              </InputGroup>
              <FieldError>{errors.current}</FieldError>
            </Field>
          )}

          <Field data-invalid={!!errors.next || undefined}>
            <FieldLabel htmlFor="new-password">New password</FieldLabel>
            <InputGroup>
              <InputGroupInput
                id="new-password"
                type={inputType}
                autoComplete="new-password"
                value={next}
                aria-invalid={!!errors.next}
                aria-describedby="new-password-rules"
                disabled={saving}
                onChange={(e) => {
                  setNext(e.target.value)
                  setErrors((er) => ({ ...er, next: undefined }))
                }}
              />
              <InputGroupAddon>
                <KeyRoundIcon />
              </InputGroupAddon>
              {!hasPassword && toggle}
            </InputGroup>
            <ul
              id="new-password-rules"
              className="grid gap-1 text-xs sm:grid-cols-3"
            >
              {PASSWORD_RULES.map((rule) => {
                const met = rule.test(next)
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
            <FieldError>{errors.next}</FieldError>
          </Field>

          <Field data-invalid={!!errors.confirm || undefined}>
            <FieldLabel htmlFor="confirm-password">
              Confirm new password
            </FieldLabel>
            <InputGroup>
              <InputGroupInput
                id="confirm-password"
                type={inputType}
                autoComplete="new-password"
                value={confirm}
                aria-invalid={!!errors.confirm}
                disabled={saving}
                onChange={(e) => {
                  setConfirm(e.target.value)
                  setErrors((er) => ({ ...er, confirm: undefined }))
                }}
              />
              <InputGroupAddon>
                <KeyRoundIcon />
              </InputGroupAddon>
            </InputGroup>
            <FieldError>{errors.confirm}</FieldError>
          </Field>

          {hasPassword && (
            <Field orientation="horizontal">
              <Checkbox
                id="revoke-sessions"
                checked={revokeOthers}
                onCheckedChange={(checked) => setRevokeOthers(checked)}
                disabled={saving}
              />
              <FieldLabel htmlFor="revoke-sessions" className="font-normal">
                Sign out of my other devices
              </FieldLabel>
            </Field>
          )}
          {!hasPassword && (
            <FieldDescription>
              You can keep using &quot;Continue with Google&quot; as well.
            </FieldDescription>
          )}
        </FieldGroup>

        <div className="mt-6 flex flex-col-reverse gap-2 border-t pt-5 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="ghost"
            disabled={saving || !dirty}
            onClick={reset}
          >
            Clear
          </Button>
          <Button type="submit" disabled={saving || !dirty}>
            {saving && <Spinner />}
            {saving
              ? "Saving..."
              : hasPassword
                ? "Change password"
                : "Set password"}
          </Button>
        </div>
      </div>
    </form>
  )
}
