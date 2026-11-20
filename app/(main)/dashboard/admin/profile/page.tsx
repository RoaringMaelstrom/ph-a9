import { requireRole } from "@/lib/session"
import PageHeader from "@/app/components/dashboard/PageHeader"
import ProfileForm from "@/app/components/dashboard/ProfileForm"

export default async function AdminProfilePage() {
  const user = await requireRole("admin", "/dashboard/admin/profile")

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
