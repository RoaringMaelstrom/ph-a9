import { CloudOffIcon } from "lucide-react"

import SectionMessage from "@/app/components/shared/SectionMessage"

/** Failed API request inside a dashboard page. */
export default function DataError({ message }: { message: string }) {
  return (
    <SectionMessage
      icon={<CloudOffIcon className="size-6" />}
      title="We couldn't load this data"
      description={`${message} Please refresh the page or try again in a moment.`}
    />
  )
}
