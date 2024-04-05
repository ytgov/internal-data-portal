import { Request, Response, NextFunction } from "express"

export function bodyAuthorizationHoistMiddleware(req: Request, res: Response, next: NextFunction) {
  const accessToken = req.body.IDP_AUTHORIZATION_TOKEN
  if (accessToken && !req.headers.authorization) {
    req.headers.authorization = `Bearer ${accessToken}`
    delete req.body.IDP_AUTHORIZATION_TOKEN
  }

  next()
}

export default bodyAuthorizationHoistMiddleware
