import { Request, Response, NextFunction } from "express"

import jwtMiddleware from "@/middlewares/jwt-middleware"
import {
  ensureAndAuthorizeCurrentUser,
  type AuthorizationRequest,
} from "@/middlewares/authorization-middleware"

import { User } from "@/models"

jest.mock("@/middlewares/jwt-middleware")
jest.mock("@/middlewares/authorization-middleware")

/**
 * Usage:
 * At the top level of a test file add:
 *   jest.mock("@/middlewares/jwt-middleware")
 *   jest.mock("@/middlewares/authorization-middleware")
 *
 * Then where you want to set the current user:
 *   mockCurrentUser(currentUser)
 *
 * @param newCurrentUser - The user to set as the current user
 */
export function mockCurrentUser(newCurrentUser: User) {
  const mockedJwtMiddleware = jest.mocked(jwtMiddleware)
  mockedJwtMiddleware.mockImplementation(async (req: Request, res: Response, next: NextFunction) =>
    next()
  )
  const mockedEnsureAndAuthorizeCurrentUser = jest.mocked(ensureAndAuthorizeCurrentUser)
  mockedEnsureAndAuthorizeCurrentUser.mockImplementation(
    async (req: AuthorizationRequest, res: Response, next: NextFunction) => {
      req.currentUser = newCurrentUser
      next()
    }
  )
}
