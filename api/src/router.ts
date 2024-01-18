import path from "path"
import fs from "fs"

import { DatabaseError } from "sequelize"
import { Router, type Request, type Response, ErrorRequestHandler, NextFunction } from "express"
import { template } from "lodash"

import { APPLICATION_NAME, GIT_COMMIT_HASH, RELEASE_TAG } from "@/config"

import jwtMiddleware from "@/middlewares/jwt-middleware"
import { ensureAndAuthorizeCurrentUser } from "@/middlewares/authorization-middleware"

import { CurrentUserController, DatasetsController } from "@/controllers"

export const router = Router()

// non-api (no authentication is required) routes
router.route("/_status").get((req: Request, res: Response) => {
  return res.json({
    RELEASE_TAG,
    GIT_COMMIT_HASH,
  })
})

// api routes
router.use("/api", jwtMiddleware, ensureAndAuthorizeCurrentUser)

// Add all the standard api controller routes here
router.route("/api/current-user").get(CurrentUserController.show)
router.route("/api/datasets").post(DatasetsController.create)

// if no other routes match, return a 404
router.use("/api", (req: Request, res: Response) => {
  return res.status(404).json({ message: "Not Found" })
})

// Special error handler for all api errors
// See https://expressjs.com/en/guide/error-handling.html#writing-error-handlers
router.use("/api", (err: ErrorRequestHandler, req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) {
    return next(err)
  }

  if (err instanceof DatabaseError) {
    console.error(err)
    return res.status(422).json({ message: "Invalid query against database." })
  }

  console.error(err)
  return res.status(500).json({ message: "Internal Server Error" })
})

// if no other non-api routes match, send the pretty 404 page
router.use("/", (req: Request, res: Response) => {
  const templatePath = path.resolve(__dirname, "web/404.html")
  try {
    const templateString = fs.readFileSync(templatePath, "utf8")
    const compiledTemplate = template(templateString)
    const result = compiledTemplate({
      applicationName: APPLICATION_NAME,
      releaseTag: RELEASE_TAG,
      gitCommitHash: GIT_COMMIT_HASH,
    })
    return res.status(404).send(result)
  } catch (error) {
    console.error(error)
    return res.status(500).send(`Error building 404 page: ${error}`)
  }
})

export default router
