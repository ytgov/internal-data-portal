import { NextFunction, Request, Response } from "express"

import User from "@/models/user"

export type Actions = "index" | "show" | "new" | "edit" | "create" | "update" | "destroy"

type ControllerRequest = Request & {
  currentUser: User
  format?: string
}

// Keep in sync with web/src/api/base-api.ts
const MAX_PER_PAGE = 1000
const DEFAULT_PER_PAGE = 10

// See https://guides.rubyonrails.org/routing.html#crud-verbs-and-actions
export class BaseController {
  protected request: ControllerRequest
  protected response: Response
  protected next: NextFunction

  constructor(req: Request, res: Response, next: NextFunction) {
    // Assumes authorization has occured first in
    // api/src/middlewares/jwt-middleware.ts and api/src/middlewares/authorization-middleware.ts
    // At some future point it would make sense to do all that logic as
    // controller actions to avoid the need for hack
    this.request = req as ControllerRequest
    this.response = res
    this.next = next
  }

  static get index() {
    return async (req: Request, res: Response, next: NextFunction) => {
      const controllerInstance = new this(req, res, next)
      return controllerInstance.index().catch(next)
    }
  }

  // Usage app.post("/api/users", UsersController.create)
  // maps /api/users to UsersController#create()
  static get create() {
    return async (req: Request, res: Response, next: NextFunction) => {
      const controllerInstance = new this(req, res, next)
      return controllerInstance.create().catch(next)
    }
  }

  static get show() {
    return async (req: Request, res: Response, next: NextFunction) => {
      const controllerInstance = new this(req, res, next)
      return controllerInstance.show().catch(next)
    }
  }

  static get update() {
    return async (req: Request, res: Response, next: NextFunction) => {
      const controllerInstance = new this(req, res, next)
      return controllerInstance.update().catch(next)
    }
  }

  static get destroy() {
    return async (req: Request, res: Response, next: NextFunction) => {
      const controllerInstance = new this(req, res, next)
      return controllerInstance.destroy().catch(next)
    }
  }

  index(): Promise<any> {
    throw new Error("Not Implemented")
  }

  create(): Promise<any> {
    throw new Error("Not Implemented")
  }

  show(): Promise<any> {
    throw new Error("Not Implemented")
  }

  update(): Promise<any> {
    throw new Error("Not Implemented")
  }

  destroy(): Promise<any> {
    throw new Error("Not Implemented")
  }

  // Internal helpers

  // This should have been loaded in the authorization middleware
  // Currently assuming that authorization happens before this controller gets called.
  // Child controllers that are on an non-authorizable route should override this method
  // and return undefined
  get currentUser(): User {
    return this.request.currentUser
  }

  get format() {
    return this.request.format
  }

  get params() {
    return this.request.params
  }

  get query() {
    return this.request.query
  }

  get pagination() {
    const page = parseInt(this.query.page?.toString() || "") || 1
    const perPage = parseInt(this.query.perPage?.toString() || "") || DEFAULT_PER_PAGE
    const limit = this.determineLimit(perPage)
    const offset = (page - 1) * limit
    return {
      page,
      perPage,
      limit,
      offset,
    }
  }

  private determineLimit(perPage: number) {
    if (perPage === -1) {
      return MAX_PER_PAGE
    }


    return Math.min(perPage, MAX_PER_PAGE)
  }
}

export default BaseController
