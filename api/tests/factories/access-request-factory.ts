import { faker } from "@faker-js/faker"

import { AccessRequest } from "@/models"

import BaseFactory from "@/factories/base-factory"

type TransientParam = {
  approved?: boolean
}

export const accessRequestFactory = BaseFactory.define<AccessRequest, TransientParam>(
  ({ sequence, transientParams, onCreate }) => {
    onCreate((accessRequest) => accessRequest.save())

    return AccessRequest.build({
      id: sequence,
      accessCode: faker.string.alphanumeric(32),
      approvedAt: transientParams.approved ? new Date() : null,
    })
  }
)

export default accessRequestFactory
