import { faker } from "@faker-js/faker"
import { Includeable } from "sequelize"

import { Role, User, UserGroupMembership } from "@/models"

import BaseFactory from "@/factories/base-factory"

type TransientParam = {
  include?: Includeable | Includeable[]
}

export const userFactory = BaseFactory.define<User, TransientParam>(
  ({ sequence, params, transientParams, associations, onCreate }) => {
    onCreate(async (user) => {
      await user.save()

      if (associations.roles) {
        const roleAttributes = associations.roles.map((role) => {
          return {
            ...role.dataValues,
            userId: user.id,
          }
        })
        await Role.bulkCreate(roleAttributes)
      }

      if (associations.groupMembership) {
        const groupMembershipAttributes = {
          ...associations.groupMembership.dataValues,
          userId: user.id,
        }
        await UserGroupMembership.create(groupMembershipAttributes)
      }

      if (transientParams.include === undefined) {
        return user
      }

      return user.reload({
        include: transientParams.include,
      })
    })

    const firstName = params.firstName || faker.person.firstName()
    const lastName = params.lastName || faker.person.lastName()

    return User.build({
      id: sequence,
      auth0Subject: `auth0|${faker.string.uuid()}`,
      email: faker.internet.email({ firstName, lastName }),
      firstName,
      lastName,
      position: faker.person.jobTitle(),
      lastSyncSuccessAt: faker.date.recent(),
    })
  }
)

export default userFactory
