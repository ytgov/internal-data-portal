import { isNumber } from "lodash"
import { faker } from "@faker-js/faker"

import { Role, User } from "@/models"
import { RoleTypes } from "@/models/role"

import BaseFactory from "@/factories/base-factory"

export const roleFactory = BaseFactory.define<Role>(({ sequence, onCreate }) => {
  onCreate((role) => role.save())

  return Role.build({
    id: sequence,
    role: faker.helpers.enumValue(RoleTypes),
  })
})

export default roleFactory
