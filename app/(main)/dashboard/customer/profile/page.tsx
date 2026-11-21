import { hasPasswordSignIn, requireRole } from "@/lib/session"
import PageHeader from "@/app/components/dashboard/PageHeader"
import PasswordForm from "@/app/components/dashboard/PasswordForm"
import ProfileForm from "@/app/components/dashboard/ProfileForm"

export default async function CustomerProfilePage() {
  const user = await requireRole("customer", "/dashboard/customer/profile")
  const hasPassword = await hasPasswordSignIn()

  return (
    <>
      <PageHeader
        title="My Profile"
        description="Update your name, photo, contact details and password."
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
      <PasswordForm hasPassword={hasPassword} />
    </>
  )
}
