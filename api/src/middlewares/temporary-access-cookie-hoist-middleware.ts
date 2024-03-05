import { Request, Response, NextFunction } from "express"

export const TEMPORARY_ACCESS_COOKIE_NAME = "temporary_access_token"

export function temporaryAccessCookieHoistMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const temporaryAccessToken = req.cookies?.[TEMPORARY_ACCESS_COOKIE_NAME]
  if (temporaryAccessToken && !req.headers.authorization) {
    req.headers.authorization = `Bearer ${temporaryAccessToken}`
  }

  next()
}

export default temporaryAccessCookieHoistMiddleware
