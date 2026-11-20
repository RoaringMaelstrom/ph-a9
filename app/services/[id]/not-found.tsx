import Link from "next/link"
import { SearchXIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import SectionMessage from "@/app/components/shared/SectionMessage"

/** Shown for invalid or unknown service ids (`notFound()` in page.tsx). */
export default function ServiceNotFound() {
  return (
    <main className="flex-1">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
        <SectionMessage
          icon={<SearchXIcon className="size-6" />}
          title="Service not found"
          description="This service doesn't exist or the link is incorrect. It may have been removed from our menu."
          action={
            <Button render={<Link href="/services" />} nativeButton={false}>
              Browse all services
            </Button>
          }
        />
      </div>
    </main>
  )
}
