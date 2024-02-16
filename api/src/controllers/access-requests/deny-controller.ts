import BaseController from "@/controllers/base-controller"

export class DenyController extends BaseController {
  async create() {
    return this.response.status(501).json({ message: "TODO: build out deny controller" })
  }
}

export default DenyController
