import { faker } from "@faker-js/faker"
import { Includeable } from "sequelize"

import { AccessGrant, Dataset, User } from "@/models"

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
        const accessGrantAttributes = associations.accessGrants.map((accessGrant) => {
          return {
            ...accessGrant.dataValues,
            datasetId: dataset.id,
          }
        })
        await AccessGrant.bulkCreate(accessGrantAttributes)
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

    const subscriptionUrl = faker.datatype.boolean(0.5) ? faker.internet.url() : null
    const subscriptionAccessCode = subscriptionUrl ? faker.string.alphanumeric(32) : null

    return Dataset.build({
      id: sequence,
      slug,
      name,
      description: faker.lorem.paragraph(),
      subscriptionUrl,
      subscriptionAccessCode,
      isSubscribable: faker.datatype.boolean(0.5),
      isSpatialData: faker.datatype.boolean(0.5),
      isLiveData: faker.datatype.boolean(0.5),
      termsOfUse: faker.datatype.boolean(0.5) ? faker.lorem.paragraph() : null,
      credits: faker.datatype.boolean(0.5) ? faker.lorem.paragraph() : null,
      ownerNotes: faker.datatype.boolean(0.5) ? faker.lorem.paragraph() : null,
      status: Dataset.ErrorTypes.OK,
      errorCode: null,
      errorDetails: null,
      publishedAt: null,
      deactivatedAt: null,
    })
  }
)

export default datasetFactory
