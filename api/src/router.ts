import path from "path"
import fs from "fs"

import { Router, type Request, type Response } from "express"
import { template } from "lodash"

import { APPLICATION_NAME, GIT_COMMIT_HASH, RELEASE_TAG } from "@/config"

import jwtMiddleware from "@/middlewares/jwt-middleware"

export const router = Router()

// some routes
router.route("/_status").get((req: Request, res: Response) => {
  return res.json({
    RELEASE_TAG,
    GIT_COMMIT_HASH,
  })
})

router.use("/api", jwtMiddleware)

// if no other api routes match, send the 404 page
router.use("/api", (req: Request, res: Response) => {
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
