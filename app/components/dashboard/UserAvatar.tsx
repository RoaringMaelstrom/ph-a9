import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function initials(name?: string | null) {
  if (!name) return "U"
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "U"
  )
}

export default function UserAvatar({
  name,
  image,
  className,
}: {
  name?: string | null
  image?: string | null
  className?: string
}) {
  return (
    <Avatar className={cn("shrink-0", className)}>
      {image && (
        <AvatarImage src={image} alt={name ?? ""} className="object-cover" />
      )}
      <AvatarFallback>{initials(name)}</AvatarFallback>
    </Avatar>
  )
}
