import { faker } from "@faker-js/faker"

import { AccessRequest } from "@/models"

import BaseFactory from "@/factories/base-factory"

export const accessRequestFactory = BaseFactory.define<AccessRequest>(({ sequence, onCreate }) => {
  onCreate((accessRequest) => accessRequest.save())

  return AccessRequest.build({
    id: sequence,
    accessCode: faker.string.alphanumeric(32),
  })
})

export default accessRequestFactory
