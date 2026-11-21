import {
  LoadingRegion,
  PageHeaderSkeleton,
} from "@/app/components/skeletons/DashboardSkeletons"
import {
  PasswordFormSkeleton,
  ProfileFormSkeleton,
} from "@/app/components/skeletons/FormSkeletons"

/** My Profile (admin): profile form + password card. */
export default function AdminProfileLoading() {
  return (
    <LoadingRegion label="Loading profile">
      <PageHeaderSkeleton
        title="My Profile"
        description="Update your name, photo, contact details and password."
      />
      <ProfileFormSkeleton />
      <PasswordFormSkeleton />
    </LoadingRegion>
  )
}
