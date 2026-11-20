import { requireRole } from "@/lib/session"
import PageHeader from "@/app/components/dashboard/PageHeader"
import ProfileForm from "@/app/components/dashboard/ProfileForm"

export default async function CustomerProfilePage() {
  const user = await requireRole("customer", "/dashboard/customer/profile")

  return (
    <>
      <PageHeader
        title="My Profile"
        description="Update your name, photo and contact details."
      />
      <ProfileForm
        user={{
          name: user.name,
          email: user.email,
          image: user.image,
          phone: user.phone,
          role: user.role,
        }}
      />
    </>
  )
}
