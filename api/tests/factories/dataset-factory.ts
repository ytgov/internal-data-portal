import { faker } from "@faker-js/faker"
import { Includeable } from "sequelize"

import { AccessGrant, AccessRequest, Dataset, User } from "@/models"

import BaseFactory from "@/factories/base-factory"

type TransientParam = {
  include?: Includeable | Includeable[]
}

class DatasetFactory extends BaseFactory<Dataset, TransientParam> {}

export const datasetFactory = DatasetFactory.define(
  ({ sequence, transientParams, associations, onCreate }) => {
    onCreate(async (dataset) => {
      await dataset.save()

      if (associations.owner) {
        const ownerAttributes = {
          ...associations.owner.dataValues,
          datasetId: dataset.id,
        }
        await User.create(ownerAttributes)
      }

      if (associations.accessGrants) {
        const accessGrantsAttributes = associations.accessGrants.map((accessGrant) => {
          return {
            ...accessGrant.dataValues,
            datasetId: dataset.id,
          }
        })
        await AccessGrant.bulkCreate(accessGrantsAttributes)
      }

      if (associations.accessRequests) {
        const accessRequestsAttributes = associations.accessRequests.map((accessRequest) => {
          return {
            ...accessRequest.dataValues,
            datasetId: dataset.id,
          }
        })
        await AccessRequest.bulkCreate(accessRequestsAttributes)
      }

      if (transientParams.include === undefined) {
        return dataset
      }

      return dataset.reload({
        include: transientParams.include,
      })
    })

    const name = faker.lorem.words({ min: 3, max: 5 })
    const slug = faker.helpers.slugify(name).toLowerCase()

    return Dataset.build({
      id: sequence,
      slug,
      name,
      description: faker.lorem.paragraph(),
    })
  }
)

export default datasetFactory
