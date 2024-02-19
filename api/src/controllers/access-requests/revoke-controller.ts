import { isNil } from "lodash"

import { AccessRequest } from "@/models"
import { AccessRequestsPolicy } from "@/policies"
import { AccessRequestWithDataset } from "@/policies/access-requests-policy"
import { RevokeService } from "@/services/access-requests"

import BaseController from "@/controllers/base-controller"

export class RevokeController extends BaseController {
  async create() {
    const accessRequest = await this.loadAccessRequest()
    if (isNil(accessRequest)) {
      return this.response.status(404).json({ message: "Access request not found." })
    }

    const policy = this.buildPolicy(accessRequest)
    if (!policy.update()) {
      return this.response
        .status(403)
        .json({ message: "You are not authorized to revoke access requests on this dataset." })
    }

    try {
      const updatedAccessRequest = await RevokeService.perform(accessRequest, this.currentUser)
      return this.response.status(200).json({ accessRequest: updatedAccessRequest })
    } catch (error) {
      return this.response.status(422).json({ message: `Access request revokal failed: ${error}` })
    }
  }

  private async loadAccessRequest(): Promise<AccessRequestWithDataset | null> {
    const { accessRequestId } = this.request.params
    const accessRequest = await AccessRequest.findByPk(accessRequestId, { include: ["dataset"] })
    if (isNil(accessRequest?.dataset)) return null

    // TODO: figure out how to make this type cast unneccessary
    return accessRequest as AccessRequestWithDataset
  }

  private buildPolicy(accessRequest: AccessRequestWithDataset) {
    return new AccessRequestsPolicy(this.currentUser, accessRequest)
  }
}

export default RevokeController
