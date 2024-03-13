import qs, { type ParsedQs } from "qs"

export { type ParsedQs }

// See api/src/app.ts -> app.set("query parser", ...)
export function stringifyQuery(params: unknown): string {
  return qs.stringify(params, {
    arrayFormat: "brackets",
    strictNullHandling: true,
  })
}

export function parseQuery(search: string): ParsedQs {
  return qs.parse(search, {
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
