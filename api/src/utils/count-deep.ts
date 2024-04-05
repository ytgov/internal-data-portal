import { forEach, isArray, isObject } from "lodash"

export function countDeep<T extends object>(object: T): number {
  let count = 0

  function countArrays(value: T | T[keyof T]) {
    if (isArray(value)) {
      count += value.length
    } else if (isObject(value)) {
      forEach(value, countArrays)
    }
  }

  countArrays(object)
  return count
}

export default countDeep
