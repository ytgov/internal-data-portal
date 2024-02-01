import { faker } from "@faker-js/faker"

export function anytime() {
  const hours = faker.number.int({ min: 0, max: 23 }).toString().padStart(2, '0')
  const minutes = faker.number.int({ min: 0, max: 59 }).toString().padStart(2, '0')
  const seconds = "00" // currently we aren't tracking time to the second

  return `${hours}:${minutes}:${seconds}`
}

export function presence<T>(value: T | undefined, defaultValue: T): T {
  return value === undefined ? defaultValue : value
}
