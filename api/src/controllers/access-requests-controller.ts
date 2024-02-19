import { WhereOptions } from "sequelize"

import { AccessRequest } from "@/models"
import { TableSerializer } from "@/serializers/access-requests"

import BaseController from "@/controllers/base-controller"

export class AccessRequestsController extends BaseController {
  async index() {
    const where = this.query.where as WhereOptions<AccessRequest>

    const totalCount = await AccessRequest.count({ where })
    const accessRequests = await AccessRequest.findAll({
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
}

export default AccessRequestsController
