import { WhereOptions } from "sequelize"
import { isEmpty, isNil } from "lodash"

import { AccessRequest, Dataset } from "@/models"
import { TableSerializer } from "@/serializers/access-requests"
import { CreateService } from "@/services/access-requests"
import { AccessRequestsPolicy } from "@/policies"
import { type AccessRequestForCreate } from "@/policies/access-requests-policy"

import BaseController from "@/controllers/base-controller"

export class AccessRequestsController extends BaseController {
  async index() {
    const where = this.query.where as WhereOptions<AccessRequest>
    const filters = this.query.filters as Record<string, unknown>

    const scopedAccessRequests = AccessRequestsPolicy.applyScope(AccessRequest, this.currentUser)

    let filteredAccessRequests = scopedAccessRequests
    if (!isEmpty(filters)) {
      Object.entries(filters).forEach(([key, value]) => {
        filteredAccessRequests = filteredAccessRequests.scope({ method: [key, value] })
      })
    }

    const totalCount = await filteredAccessRequests.count({ where })
    const accessRequests = await filteredAccessRequests.findAll({
      where,
      include: [
        {
          association: "requestor",
          include: [
            {
              association: "groupMembership",
              include: ["department"],
            },
          ],
        },
        "accessGrant",
        { association: "dataset", include: ["integration"] },
      ],
      limit: this.pagination.limit,
      offset: this.pagination.offset,
      order: [["requestor", "firstName", "ASC"]],
    })

    try {
      const serializedAccessRequests = TableSerializer.perform(accessRequests, this.currentUser)
      return this.response.json({ accessRequests: serializedAccessRequests, totalCount })
    } catch (error) {
      return this.response
        .status(500)
        .json({ message: `Failed to serialize access requests: ${error}` })
    }
  }

  async create() {
    const accessRequest = await this.buildAccessRequest()
    if (isNil(accessRequest)) {
      return this.response.status(404).json({ message: "Access request could not be built." })
    }

    const policy = this.buildPolicy(accessRequest)
    if (!policy.create()) {
      return this.response
        .status(403)
        .json({ message: "You are not authorized to make access requests for this dataset." })
    }

    const permittedAttributes = policy.permitAttributesForCreate(this.request.body)
    try {
      const accessRequest = await CreateService.perform(permittedAttributes, this.currentUser)
      return this.response.status(201).json({ accessRequest })
    } catch (error) {
      return this.response.status(422).json({ message: `Access request creation failed: ${error}` })
    }
  }

  private async buildAccessRequest() {
    const accessRequest = AccessRequest.build(this.request.body)
    if (isNil(accessRequest)) return null

    const { datasetId, accessGrantId } = this.request.body
    if (isNil(datasetId) || isNil(accessGrantId)) return null

    const dataset = await Dataset.findByPk(datasetId, {
      include: [
        {
          association: "owner",
          include: [
            {
              association: "groupMembership",
              include: ["department", "division", "branch", "unit"],
            },
          ],
        },
        "accessGrants",
      ],
    })
    if (isNil(dataset)) return null

    accessRequest.dataset = dataset

    return accessRequest as AccessRequestForCreate
  }

  private buildPolicy(accessRequest: AccessRequestForCreate) {
    return new AccessRequestsPolicy(this.currentUser, accessRequest)
  }
}

export default AccessRequestsController
