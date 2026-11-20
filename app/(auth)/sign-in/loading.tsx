import AuthShell from "@/app/components/shared/AuthShell"
import AuthFormSkeleton from "@/app/components/skeletons/AuthFormSkeleton"

export default function SignInLoading() {
  return (
    <AuthShell>
      <AuthFormSkeleton fields={2} />
    </AuthShell>
  )
}
