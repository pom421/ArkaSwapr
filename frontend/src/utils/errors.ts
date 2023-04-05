export const hasErrors = (errors: Record<string, unknown>) => {
  for (const value of Object.values(errors)) {
    if (value) return true
  }
  return false
}
