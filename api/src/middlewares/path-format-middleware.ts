import { Request, Response, NextFunction } from "express"

export type RequestWithFormat = Request & {
  format?: string
}

/**
 * Adds support for /my/url.xxx on all routes, where xxx is a format
 *
 * TODO: also support /my/url?format=xxx style
 */
export default function pathFormatMiddleware(req: RequestWithFormat, res: Response, next: NextFunction) {
  const formatRegex = /(.+)\.(\w+)$/
  const match = req.path.match(formatRegex)

  if (match) {
    // Add the format as a parameter to req.params
    req.format = match[2]

    // Modify the URL path to strip off the format
    req.url = match[1]
  }

  next()
}
