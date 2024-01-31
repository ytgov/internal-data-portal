import { faker } from "@faker-js/faker"
import { CreationAttributes } from "sequelize"

import { Dataset, AccessGrant } from "@/models"
import { AccessTypes, GrantLevels } from "@/models/access-grant"

import BaseController from "@/controllers/base-controller"

export class ApplyRandomAccessGrantsController extends BaseController {
  async create() {
    try {
      await AccessGrant.destroy({ where: {} })
      await this.applyRandomAccessGrantsToDatasets()
      return this.response
        .status(201)
        .json({ message: "Random access grants applied to random datasets." })
    } catch (error) {
      return this.response
        .status(422)
        .json({ message: `Could not apply random access grants: ${error}` })
    }
  }

  private async applyRandomAccessGrantsToDatasets() {
    const datasets = await Dataset.findAll()

    const promises = datasets.map(async (dataset) => {
      const randomGrantLevels = faker.helpers.arrayElements(Object.values(GrantLevels), {
        min: 0,
        max: 3,
      })

      const randomAccessGrantAttributes: CreationAttributes<AccessGrant>[] = randomGrantLevels.map((randomGrantLevel) => ({
        datasetId: dataset.id,
        ownerId: dataset.ownerId,
        // TODO: requestorId: faker.helpers.arrayElement(users - dataset.owner).id,
        grantLevel: randomGrantLevel,
        accessType: faker.helpers.arrayElement(Object.values(AccessTypes)),
        isProjectDescriptionRequired: faker.datatype.boolean(),
      }))
      return AccessGrant.bulkCreate(randomAccessGrantAttributes)
    })

    return Promise.all(promises)
  }
}

export default ApplyRandomAccessGrantsController
