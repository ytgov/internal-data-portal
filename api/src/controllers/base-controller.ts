import { NextFunction, Request, Response } from "express"

import User from "@/models/user"

export type Actions = "index" | "show" | "new" | "edit" | "create" | "update" | "destroy"

type ControllerRequest = Request & {
  currentUser: User
}

// See https://guides.rubyonrails.org/routing.html#crud-verbs-and-actions
export class BaseController {
  protected request: ControllerRequest
  protected response: Response
  protected next: NextFunction

  constructor(req: ControllerRequest, res: Response, next: NextFunction) {
    this.request = req
    this.response = res
    this.next = next
  }

  static get index() {
    return async (req: ControllerRequest, res: Response, next: NextFunction) => {
      const controllerInstance = new this(req, res, next)
      return controllerInstance.index().catch(next)
    }
  }

  // Usage app.post("/api/users", UsersController.create)
  // maps /api/users to UsersController#create()
  static get create() {
    return async (req: ControllerRequest, res: Response, next: NextFunction) => {
      const controllerInstance = new this(req, res, next)
      return controllerInstance.create().catch(next)
    }
  }

  static get show() {
    return async (req: ControllerRequest, res: Response, next: NextFunction) => {
      const controllerInstance = new this(req, res, next)
      return controllerInstance.show().catch(next)
    }
  }

  static get update() {
    return async (req: ControllerRequest, res: Response, next: NextFunction) => {
      const controllerInstance = new this(req, res, next)
      return controllerInstance.update().catch(next)
    }
  }

  static get destroy() {
    return async (req: ControllerRequest, res: Response, next: NextFunction) => {
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

  get params() {
    return this.request.params
  }

  get query() {
    return this.request.query
  }

  get pagination() {
    const page = parseInt(this.query.page?.toString() || "") || 1
    const perPage = parseInt(this.query.perPage?.toString() || "") || 10
    const limit = Math.max(10, Math.min(perPage, 1000)) // restrict max limit to 1000 for safety
    const offset = (page - 1) * limit
    return {
      page,
      perPage,
      limit,
      offset,
    }
  }
}

export default BaseController
