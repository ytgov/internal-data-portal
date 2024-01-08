import { Router, type Request, type Response } from "express"

import { GIT_COMMIT_HASH, RELEASE_TAG } from "@/config"

export const router = Router()

// some routes
router.route("/_status").get((req: Request, res: Response) => {
  res.json({
    RELEASE_TAG,
    GIT_COMMIT_HASH,
  })
})

export default router
