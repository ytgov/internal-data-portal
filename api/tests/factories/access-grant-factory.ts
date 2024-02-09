import { faker } from "@faker-js/faker"

import { AccessGrant } from "@/models"
import { AccessTypes, GrantLevels } from "@/models/access-grant"

import BaseFactory from "@/factories/base-factory"

export const accessGrantFactory = BaseFactory.define<AccessGrant>(({ sequence, onCreate }) => {
  onCreate((accessGrant) => accessGrant.save())

  return AccessGrant.build({
    id: sequence,
    accessType: faker.helpers.enumValue(AccessTypes),
    grantLevel: faker.helpers.enumValue(GrantLevels),
    isProjectDescriptionRequired: faker.datatype.boolean(0.3),
  })
})

export default accessGrantFactory
