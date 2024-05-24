export const required = (value: unknown) => !!value || "Field is required"
export const minimum = (min: number) => (value: number) =>
  value >= min || `Must be greater than or equal to ${min}`
