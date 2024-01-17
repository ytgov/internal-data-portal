import { type NextFunction, type Response } from "express"
import { type Request as JwtRequest } from "express-jwt"

import auth0Integration, { Auth0PayloadError } from "@/integrations/auth0-integration"
import { Role, User } from "@/models"

type AuthorizationRequest = JwtRequest & {
  currentUser?: User
}

async function findOrCreateUserFromAuth0Token(token: string): Promise<User> {
  const { auth0Subject, email, firstName, lastName } = await auth0Integration.getUserInfo(token)

  const [user, created] = await User.findOrCreate({
    where: { auth0Subject },
    defaults: {
      auth0Subject,
      email: email,
      firstName,
      lastName,
    },
  })
  await Role.findOrCreate({
    where: {
      userId: user.id,
      role: Role.Types.USER,
    },
    defaults: {
      userId: user.id,
      role: Role.Types.USER,
    },
  })

  await user.reload({
    include: ["roles"],
  })

  if (created) {
    console.log(`CREATED USER FOR ${email}: ${JSON.stringify(user.dataValues)}`)
  }

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
    include: ["roles"],
  })
  if (user !== null) {
    req.currentUser = user
    return next()
  }

  try {
    const token = req.headers.authorization || ""
    const user = await findOrCreateUserFromAuth0Token(token)
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
