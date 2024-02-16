import { faker } from "@faker-js/faker"
import { CreationAttributes } from "sequelize"
import { times } from "lodash"

import { AccessGrant, AccessRequest, User } from "@/models"
import { AccessTypes } from "@/models/access-grant"

import BaseController from "@/controllers/base-controller"

export class AddRandomAccessRequestsController extends BaseController {
  async create() {
    try {
      await AccessRequest.destroy({ where: {}, force: true })
      await this.addRandomAccessRequestsToDatasets()
      return this.response
        .status(201)
        .json({ message: "Random access requests added to random datasets." })
    } catch (error) {
      return this.response
        .status(422)
        .json({ message: `Could not add random access requests: ${error}` })
    }
  }

  private async addRandomAccessRequestsToDatasets() {
    const accessGrants = await AccessGrant.findAll()
    const users = await User.findAll()

    const promises = accessGrants.map(async (accessGrant) => {
      const numberOfAccessRequestsPerGrant = faker.number.int({ min: 0, max: 3 })

      const randomAccessRequestAttributes: CreationAttributes<AccessRequest>[] = times(
        numberOfAccessRequestsPerGrant,
        () => {
          let projectAttributes = {}
          if (accessGrant.isProjectDescriptionRequired) {
            projectAttributes = {
              projectName: faker.lorem.words(),
              projectDescription: faker.lorem.paragraph(),
            }
          }

          let approvalAttributes = {}
          if (accessGrant.accessType === AccessTypes.SELF_SERVE_ACCESS) {
            approvalAttributes = {
              approvedAt: faker.date.recent(),
              approverId: faker.helpers.arrayElement(users).id,
            }
          }

          return {
            datasetId: accessGrant.datasetId,
            accessGrantId: accessGrant.id,
            requestorId: faker.helpers.arrayElement(users).id,
            accessCode: faker.string.alphanumeric(10),
            ...projectAttributes,
            ...approvalAttributes,
          }
        }
      )

      return AccessRequest.bulkCreate(randomAccessRequestAttributes)
    })

    return Promise.all(promises)
  }
}

export default AddRandomAccessRequestsController
