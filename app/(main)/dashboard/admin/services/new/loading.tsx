import {
  LoadingRegion,
  PageHeaderSkeleton,
} from "@/app/components/skeletons/DashboardSkeletons"
import { ServiceFormSkeleton } from "@/app/components/skeletons/FormSkeletons"

/** Add Service: header + empty service form. */
export default function AddServiceLoading() {
  return (
    <LoadingRegion label="Loading form">
      <PageHeaderSkeleton
        title="Add Service"
        description="Create a new service for the salon menu. New services are active by default."
      />
      <ServiceFormSkeleton />
    </LoadingRegion>
  )
}
