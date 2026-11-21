"use client"

import { useEffect, useRef } from "react"

import { toast } from "@/components/ui/toast"

/** Shows one toast when a server-rendered page first appears. */
export default function ToastOnMount({
  title,
  description,
  type,
}: {
  title: string
  description?: string
  type: "success" | "error" | "warning" | "info"
}) {
  const shown = useRef(false)

  useEffect(() => {
    if (shown.current) return
    shown.current = true
    toast.add({ title, description, type })
  }, [title, description, type])

  return null
}
