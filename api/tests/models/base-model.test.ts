import { Dataset, User } from "@/models"

import { datasetFactory, userFactory } from "@/factories"

describe("api/src/models/base-model.ts", () => {
  describe("BaseModel", () => {
    describe(".findBySlugOrPk", () => {
      test("when passed an id, returns the object", async () => {
        // Arrange
        const user = await userFactory.create()
        const dataset = await datasetFactory.create({
          creatorId: user.id,
          ownerId: user.id,
        })

        // Act
        const result = await Dataset.findBySlugOrPk(dataset.id)

        // Assert
        expect(dataset.dataValues).toEqual(result?.dataValues)
      })

      test("when passed a slug, returns the object", async () => {
        // Arrange
        const user = await userFactory.create()
        const dataset = await datasetFactory.create({
          creatorId: user.id,
          ownerId: user.id,
        })

        // Act
        const result = await Dataset.findBySlugOrPk(dataset.slug)

        // Assert
        expect(dataset.dataValues).toEqual(result?.dataValues)
      })

      test("when the model does not have a slug attribute, throws an error", async () => {
        // Arrange
        await userFactory.create()

        // Act
        const result = User.findBySlugOrPk("some-slug")

        // Assert
        await expect(result).rejects.toThrow("User does not have a 'slug' attribute.")
      })
    })
  })
})
