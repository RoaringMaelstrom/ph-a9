"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { BanIcon, LogOutIcon } from "lucide-react"

import { signOut } from "@/lib/auth-client"
import { SALON_INFO } from "@/lib/site"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

/** Shown instead of the dashboard when the account is blocked. */
export default function BlockedNotice() {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center rounded-2xl border border-dashed bg-muted/40 px-6 py-14 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <BanIcon className="size-6" />
      </span>
      <h1 className="mt-4 text-xl font-semibold">Your account is blocked</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        You can&apos;t use the dashboard or book appointments right now. If you
        think this is a mistake, contact us at{" "}
        <a
          href={`mailto:${SALON_INFO.email}`}
          className="font-medium text-primary hover:underline"
        >
          {SALON_INFO.email}
        </a>
        .
      </p>
      <Button
        className="mt-6"
        variant="outline"
        disabled={busy}
        onClick={async () => {
          setBusy(true)
          await signOut()
          router.push("/")
          router.refresh()
        }}
      >
        {busy ? <Spinner /> : <LogOutIcon />}
        Sign out
      </Button>
    </div>
  )
}
