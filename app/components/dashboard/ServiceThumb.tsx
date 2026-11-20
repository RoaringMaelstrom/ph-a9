import Image from "next/image"
import { ScissorsIcon } from "lucide-react"

import { cn } from "@/lib/utils"

/** Small square service image for table rows. */
export default function ServiceThumb({
  src,
  alt = "",
  className,
}: {
  src?: string | null
  alt?: string
  className?: string
}) {
  return (
    <span
      className={cn(
        "relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted text-muted-foreground",
        className
      )}
    >
      {src ? (
        <Image src={src} alt={alt} fill sizes="44px" className="object-cover" />
      ) : (
        <ScissorsIcon className="size-4" />
      )}
    </span>
  )
}
