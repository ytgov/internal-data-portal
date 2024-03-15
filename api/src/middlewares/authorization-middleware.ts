import { type NextFunction, type Response } from "express"
import { type Request as JwtRequest } from "express-jwt"
import { isNil } from "lodash"

import { User } from "@/models"
import { Users } from "@/services"

import auth0Integration, { Auth0PayloadError } from "@/integrations/auth0-integration"

export type AuthorizationRequest = JwtRequest & {
  currentUser?: User
}

async function findUserFromAuth0Subject(auth0Subject: string): Promise<User | null> {
  return User.findOne({
    where: { auth0Subject },
    include: [
      "roles",
      {
        association: "groupMembership",
        include: ["department", "division", "branch", "unit"],
      },
    ],
  })
}

async function findAndSetupUserFromEmailFirstLogin(
  email: string,
  auth0Subject: string
): Promise<User | null> {
  const user = await User.byEmailIgnoreCase(email).findOne({
    where: { setupFromEmailFirstLogin: true },
  })
  if (isNil(user)) return null

  await user.update({ auth0Subject, setupFromEmailFirstLogin: false })
  return user.reload({
    include: [
      "roles",
      {
        association: "groupMembership",
        include: ["department", "division", "branch", "unit"],
      },
    ],
  })
}

async function ensureUserFromAuth0Token(token: string): Promise<User> {
  const { auth0Subject, email, firstName, lastName } = await auth0Integration.getUserInfo(token)
  let user = await findUserFromAuth0Subject(auth0Subject)
  if (!isNil(user)) return user

  user = await findAndSetupUserFromEmailFirstLogin(email, auth0Subject)
  if (!isNil(user)) {
    console.log(`SETUP User#${user.id} with ${email}`)
    return user
  }

  user = await Users.CreateService.perform({
    auth0Subject,
    email,
    firstName,
    lastName,
  })
  console.log(`CREATED User#${user.id} with ${email}`)
  return user
}

// Requires api/src/middlewares/jwt-middleware.ts to be run first
// I'd love to merge that code in here at some point, or make all this code a controller "before action"
// I'm uncomfortable with creating users automatically here, I'd rather the front-end requested
// user creation directly, and might switch to that in the future.
export async function ensureAndAuthorizeCurrentUser(
  req: AuthorizationRequest,
  res: Response,
  next: NextFunction
) {
  const user = await User.findOne({
    where: { auth0Subject: req.auth?.sub }, // req.auth from express-jwt
    include: [
      "roles",
      {
        association: "groupMembership",
        include: ["department", "division", "branch", "unit"],
      },
    ],
  })
  if (user !== null) {
    req.currentUser = user
    return next()
  }

  try {
    const token = req.headers.authorization || ""
    const user = await ensureUserFromAuth0Token(token)
    req.currentUser = user
    return next()
  } catch (error) {
    if (error instanceof Auth0PayloadError) {
      console.log(error)
      return res.status(502).json({ message: "External authorization api failed." })
    } else {
      return res.status(401).json({ message: "User authentication failed." })
    }
  }
}
