import { faker } from "@faker-js/faker"

import { User } from "@/models"

import BaseFactory from "@/factories/base-factory"

export const userFactory = BaseFactory.define<User>(({ sequence, params, onCreate }) => {
  onCreate((user) => user.save())

  const firstName = params.firstName || faker.person.firstName()
  const lastName = params.lastName || faker.person.lastName()

  return User.build({
    id: sequence,
    auth0Subject: `auth0|${faker.string.uuid()}`,
    email: faker.internet.email({ firstName, lastName }),
    firstName,
    lastName,
    position: faker.person.jobTitle(),
    lastEmployeeDirectorySyncAt: faker.date.recent(),
  })
})

export default userFactory
