import BaseController from "@/controllers/base-controller"

export class ApproveController extends BaseController {
  async create() {
    return this.response.status(501).json({ message: "TODO: build out approve controller" })
  }
}

export default ApproveController
