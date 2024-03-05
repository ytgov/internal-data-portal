import { TEMPORARY_ACCESS_COOKIE_NAME } from "@/middlewares/temporary-access-cookie-hoist-middleware"

import BaseController from "@/controllers/base-controller"

export const TEMPORARY_ACCESS_COOKIE_EXPIRY = 60 * 1000 // 1 minute in milliseconds

export class TemporaryAccessCookieController extends BaseController {
  async create() {
    const authHeader = this.request.headers.authorization
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7, authHeader.length)

      const secure = process.env.NODE_ENV !== "development"
      this.response.cookie(TEMPORARY_ACCESS_COOKIE_NAME, token, {
        httpOnly: true,
        secure,
        sameSite: "strict",
        maxAge: TEMPORARY_ACCESS_COOKIE_EXPIRY,
      })
      this.response.end()
    } else {
      this.response.status(401).send({
        message: "Authorization token missing or improperly formatted",
      })
    }
  }
}

export default TemporaryAccessCookieController
