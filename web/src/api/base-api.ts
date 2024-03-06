import qs from "qs"

// See api/src/app.ts -> app.set("query parser", ...)
export function paramsSerializer(params: unknown) {
  return qs.stringify(params, {
    arrayFormat: "brackets",
    strictNullHandling: true,
  })
}

export type Policy = {
  show: boolean
  create: boolean
  update: boolean
  destroy: boolean
}

// Keep in sync with api/src/controllers/base-controller.ts
export const MAX_PER_PAGE = 1000
