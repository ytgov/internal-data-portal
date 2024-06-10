export function acronymize(name: string) {
  return name
    .trim()
    .replace(/\s+/g, " ")
    .split(" ")
    .filter((word) => word[0] === word[0].toUpperCase())
    .map((word) => word[0])
    .join("")
}

export default acronymize
