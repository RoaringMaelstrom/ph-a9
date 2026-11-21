import {
  LoadingRegion,
  PageHeaderSkeleton,
} from "@/app/components/skeletons/DashboardSkeletons"
import { ServiceFormSkeleton } from "@/app/components/skeletons/FormSkeletons"

/** Update Service: title, service name (loading), "All services" button, form. */
export default function EditServiceLoading() {
  return (
    <LoadingRegion label="Loading service">
      <PageHeaderSkeleton title="Update Service" action="w-32" />
      <ServiceFormSkeleton isEdit />
    </LoadingRegion>
  )
}
