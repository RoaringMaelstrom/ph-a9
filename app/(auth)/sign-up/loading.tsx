import AuthShell from "@/app/components/shared/AuthShell"
import AuthFormSkeleton from "@/app/components/skeletons/AuthFormSkeleton"

export default function SignUpLoading() {
  return (
    <AuthShell>
      <AuthFormSkeleton fields={3} passwordRules imagePicker />
    </AuthShell>
  )
}
