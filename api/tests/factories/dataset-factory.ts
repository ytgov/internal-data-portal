import { faker } from "@faker-js/faker"

import { Dataset } from "@/models"

import BaseFactory from "@/factories/base-factory"

class DatasetFactory extends BaseFactory<Dataset> {}

export const datasetFactory = DatasetFactory.define(({ sequence, onCreate }) => {
  onCreate((Dataset) => Dataset.save())

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
})

export default datasetFactory
