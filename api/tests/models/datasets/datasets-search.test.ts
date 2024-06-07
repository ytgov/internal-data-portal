import { Op } from "sequelize"

import { Dataset } from "@/models"
import { datasetsSearch } from "@/models/datasets"
import { TaggableTypes } from "@/models/tagging"
import { datasetFactory, tagFactory, taggingFactory, userFactory } from "@/factories"

describe("api/src/models/datasets/datasets-search.ts", () => {
  describe(".datasetsSearch", () => {
    test("when dataset name matches search token, returns the dataset", async () => {
      // Arrange
      const datasetOwner = await userFactory.create()
      const datasetWithMatchingName = await datasetFactory.create({
        creatorId: datasetOwner.id,
        ownerId: datasetOwner.id,
        name: "Yukon River Data",
      })
      await datasetFactory.create({
        creatorId: datasetOwner.id,
        ownerId: datasetOwner.id,
        name: "Something that doesn't match",
      })
      const searchToken = "River"

      // Act
      const searchQuery = datasetsSearch()
      const result = await Dataset.findAll({
        where: { id: { [Op.in]: searchQuery } },
        replacements: {
          searchTokenWildcard: `%${searchToken}%`,
          searchToken,
        },
      })

      // Assert
      expect(result).toEqual([
        expect.objectContaining({
          id: datasetWithMatchingName.id,
        }),
      ])
    })

    test("when dataset description matches search token, returns the dataset", async () => {
      // Arrange
      const datasetOwner = await userFactory.create()
      const datasetWithMatchingDescription = await datasetFactory.create({
        creatorId: datasetOwner.id,
        ownerId: datasetOwner.id,
        description: "Data about rivers in the Yukon",
      })
      await datasetFactory.create({
        creatorId: datasetOwner.id,
        ownerId: datasetOwner.id,
        description: "Something that doesn't match",
      })
      const searchToken = "river"

      // Act
      const searchQuery = datasetsSearch()
      const result = await Dataset.findAll({
        where: { id: { [Op.in]: searchQuery } },
        replacements: {
          searchTokenWildcard: `%${searchToken}%`,
          searchToken,
        },
      })

      // Assert
      expect(result).toEqual([
        expect.objectContaining({
          id: datasetWithMatchingDescription.id,
        }),
      ])
    })

    test("when dataset tag name matches search token, returns the dataset", async () => {
      // Arrange
      const datasetOwner = await userFactory.create()
      const datasetWithMatchingTag = await datasetFactory.create({
        creatorId: datasetOwner.id,
        ownerId: datasetOwner.id,
      })
      const otherDatasetWithMatchingTag = await datasetFactory.create({
        creatorId: datasetOwner.id,
        ownerId: datasetOwner.id,
      })
      await datasetFactory.create({
        creatorId: datasetOwner.id,
        ownerId: datasetOwner.id,
      })
      const matchingTag = await tagFactory.create({ name: "aaaaaaa" })
      const otherMatchingTag = await tagFactory.create({ name: "bbbaaabbb" })
      await taggingFactory.create({
        taggableId: datasetWithMatchingTag.id,
        taggableType: TaggableTypes.DATASET,
        tagId: matchingTag.id,
      })
      await taggingFactory.create({
        taggableId: otherDatasetWithMatchingTag.id,
        taggableType: TaggableTypes.DATASET,
        tagId: otherMatchingTag.id,
      })

      const searchToken = "aaa"

      // Act
      const searchQuery = datasetsSearch()
      const result = await Dataset.findAll({
        where: { id: { [Op.in]: searchQuery } },
        replacements: {
          searchTokenWildcard: `%${searchToken}%`,
          searchToken,
        },
      })

      // Assert
      expect(result).toEqual([
        expect.objectContaining({
          id: datasetWithMatchingTag.id,
        }),
        expect.objectContaining({
          id: otherDatasetWithMatchingTag.id,
        }),
      ])
    })
  })
})
