import { isArray, isObject, mapValues, take } from "lodash"

export function truncateDeep<T extends object>(object: T, maxRecords: number): T {
  function truncate(value: T): unknown {
    if (isArray(value)) {
      return take(value, maxRecords)
    } else if (isObject(value)) {
      return mapValues(value, truncate)
    }

    return value
  }

  return truncate(object) as T
}

export default truncateDeep
