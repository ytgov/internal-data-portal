import { isArray, isString } from "lodash"

export function isStringArray<T>(data: T | string[]): data is string[] {
  return isArray(data) && data.every(isString)
}

export default isStringArray
