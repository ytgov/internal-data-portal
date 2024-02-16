import BaseController from "@/controllers/base-controller"

export class RevokeController extends BaseController {
  async create() {
    return this.response.status(501).json({ message: "TODO: build out revoke controller" })
  }
}

export default RevokeController
