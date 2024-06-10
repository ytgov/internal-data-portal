import { faker } from "@faker-js/faker"

import acronymize from "@/utils/acronymize"
import { UserGroup } from "@/models"
import { DEFAULT_ORDER, UserGroupTypes } from "@/models/user-groups"

import { presence } from "@/factories/helpers"
import BaseFactory from "@/factories/base-factory"

export const userGroupFactory = BaseFactory.define<UserGroup>(({ sequence, params, onCreate }) => {
  onCreate((userGroup) => userGroup.save())

  const type = presence(params.type, faker.helpers.enumValue(UserGroupTypes))

  // TODO: make sure every type except "department" has a parent

  const fakeName = faker.lorem.words({ min: 1, max: 3 })
  const name = `${fakeName} ${type} ${sequence}`
  const acronym = acronymize(name)

  return UserGroup.build({
    id: sequence,
    type,
    name,
    acronym,
    order: DEFAULT_ORDER,
  })
})

export default userGroupFactory
