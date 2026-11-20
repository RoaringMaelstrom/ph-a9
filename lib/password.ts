/** Password rules from the assignment. Shared by the sign-up form and the auth server. */
export const PASSWORD_RULES = [
  { id: "length", label: "At least 6 characters", test: (p: string) => p.length >= 6 },
  { id: "upper", label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { id: "lower", label: "One lowercase letter", test: (p: string) => /[a-z]/.test(p) },
] as const

/** Returns the first unmet rule's message, or null if the password is valid. */
export function passwordError(password: string) {
  const failed = PASSWORD_RULES.find((rule) => !rule.test(password))
  return failed ? `Password must contain ${failed.label.toLowerCase()}.` : null
}
