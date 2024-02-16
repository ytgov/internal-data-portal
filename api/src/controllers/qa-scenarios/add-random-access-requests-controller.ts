import { faker } from "@faker-js/faker"
import { CreationAttributes } from "sequelize"
import { times } from "lodash"

import { AccessGrant, AccessRequest, Role, User, UserGroup, UserGroupMembership } from "@/models"
import { AccessTypes } from "@/models/access-grant"

import BaseController from "@/controllers/base-controller"
import { RoleTypes } from "@/models/role"
import { UserGroupTypes } from "@/models/user-groups"

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
    const departments = await UserGroup.findAll({
      where: {
        type: UserGroupTypes.DEPARTMENT,
      },
    })

    const datasetIdToRequestorIdMap = new Map<number, number>()

    const promises = accessGrants.map(async (accessGrant) => {
      const numberOfAccessRequestsPerGrant = faker.number.int({ min: 0, max: 3 })

      const randomAccessRequestAttributes: CreationAttributes<AccessRequest>[] = await Promise.all(
        times(numberOfAccessRequestsPerGrant, async () => {
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

          let requestor = faker.helpers.arrayElement(users)
          if (datasetIdToRequestorIdMap.has(accessGrant.datasetId)) {
            if (users.length > datasetIdToRequestorIdMap.size) {
              do {
                requestor = faker.helpers.arrayElement(users)
              } while (datasetIdToRequestorIdMap.get(accessGrant.datasetId) === requestor.id)
            } else {
              requestor = await this.createFakeUser(departments)
            }
          }

          datasetIdToRequestorIdMap.set(accessGrant.datasetId, requestor.id)

          return {
            datasetId: accessGrant.datasetId,
            accessGrantId: accessGrant.id,
            requestorId: requestor.id,
            accessCode: faker.string.alphanumeric(10),
            ...projectAttributes,
            ...approvalAttributes,
          }
        })
      )

      return AccessRequest.bulkCreate(randomAccessRequestAttributes)
    })

    return Promise.all(promises)
  }

  private async createFakeUser(departments: UserGroup[]): Promise<User> {
    const firstName = faker.person.firstName()
    const lastName = faker.person.lastName()

    const user = await User.create({
      auth0Subject: `auth0|${faker.string.uuid()}`,
      email: faker.internet.email({ firstName, lastName }),
      firstName,
      lastName,
      position: faker.person.jobTitle(),
      lastEmployeeDirectorySyncAt: faker.date.recent(),
    })

    await Role.create({
      userId: user.id,
      role: faker.helpers.enumValue(RoleTypes),
    })

    await UserGroupMembership.create({
      userId: user.id,
      departmentId: faker.helpers.arrayElement(departments).id,
    })
    return user
  }
}

export default AddRandomAccessRequestsController
