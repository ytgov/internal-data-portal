import { faker } from "@faker-js/faker"

import { UserGroup } from "@/models"
import { DEFAULT_ORDER, UserGroupTypes } from "@/models/user-groups"

import { presence } from "@/factories/helpers"
import BaseFactory from "@/factories/base-factory"

export const userGroupFactory = BaseFactory.define<UserGroup>(({ sequence, params, onCreate }) => {
  onCreate((userGroup) => userGroup.save())

  const type = presence(params.type, faker.helpers.enumValue(UserGroupTypes))

  // TODO: make sure every type except "department" has a parent

  return UserGroup.build({
    id: sequence,
    type,
    name: `${type} ${sequence}`,
    order: DEFAULT_ORDER,
  })
})

export default userGroupFactory
