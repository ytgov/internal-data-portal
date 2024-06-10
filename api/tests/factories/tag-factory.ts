import { faker } from "@faker-js/faker"

import { Tag } from "@/models"

import BaseFactory from "@/factories/base-factory"

export const tagFactory = BaseFactory.define<Tag>(({ sequence, onCreate }) => {
  onCreate((tag) => tag.save())

  return Tag.build({
    id: sequence,
    name: faker.lorem.word(),
  })
})

export default tagFactory
