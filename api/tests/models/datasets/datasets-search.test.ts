import { Op } from "sequelize"

import { Dataset } from "@/models"
import { datasetsSearch } from "@/models/datasets"
import { TaggableTypes } from "@/models/tagging"
import {
  datasetFactory,
  datasetStewardshipFactory,
  tagFactory,
  taggingFactory,
  userFactory,
  userGroupFactory,
} from "@/factories"
import { UserGroupTypes } from "@/models/user-groups"

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

    test("when dataset stewardship department name matches, returns the dataset", async () => {
      // Arrange
      const user = await userFactory.create()
      const dataset1 = await datasetFactory.create({
        creatorId: user.id,
        ownerId: user.id,
      })
      const dataset2 = await datasetFactory.create({
        creatorId: user.id,
        ownerId: user.id,
      })
      await datasetFactory.create({
        creatorId: user.id,
        ownerId: user.id,
      })
      const department1 = await userGroupFactory.create({
        type: UserGroupTypes.DEPARTMENT,
        name: "aaa-bbb-ccc",
      })
      const department2 = await userGroupFactory.create({
        type: UserGroupTypes.DEPARTMENT,
        name: "bbb-ccc-ddd",
      })
      await datasetStewardshipFactory.create({
        datasetId: dataset1.id,
        ownerId: user.id,
        supportId: user.id,
        departmentId: department1.id,
      })
      await datasetStewardshipFactory.create({
        datasetId: dataset2.id,
        ownerId: user.id,
        supportId: user.id,
        departmentId: department2.id,
      })

      const searchToken = "bbb"

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
          id: dataset1.id,
        }),
        expect.objectContaining({
          id: dataset2.id,
        }),
      ])
    })

    test("when dataset stewardship division name matches, returns the dataset", async () => {
      // Arrange
      const user = await userFactory.create()
      const dataset1 = await datasetFactory.create({
        creatorId: user.id,
        ownerId: user.id,
      })
      const dataset2 = await datasetFactory.create({
        creatorId: user.id,
        ownerId: user.id,
      })
      await datasetFactory.create({
        creatorId: user.id,
        ownerId: user.id,
      })
      const department1 = await userGroupFactory.create({
        type: UserGroupTypes.DEPARTMENT,
        name: "zzzzzzzzz",
      })
      const department2 = await userGroupFactory.create({
        type: UserGroupTypes.DEPARTMENT,
        name: "zzzzzzzzzzz",
      })
      const division1 = await userGroupFactory.create({
        type: UserGroupTypes.DIVISION,
        name: "aaa-bbb-ccc",
      })
      const division2 = await userGroupFactory.create({
        type: UserGroupTypes.DIVISION,
        name: "bbb-ccc-ddd",
      })
      await datasetStewardshipFactory.create({
        datasetId: dataset1.id,
        ownerId: user.id,
        supportId: user.id,
        departmentId: department1.id,
        divisionId: division1.id,
      })
      await datasetStewardshipFactory.create({
        datasetId: dataset2.id,
        ownerId: user.id,
        supportId: user.id,
        departmentId: department2.id,
        divisionId: division2.id,
      })

      const searchToken = "bbb"

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
          id: dataset1.id,
        }),
        expect.objectContaining({
          id: dataset2.id,
        }),
      ])
    })

    test("when dataset stewardship branch name matches, returns the dataset", async () => {
      // Arrange
      const user = await userFactory.create()
      const dataset1 = await datasetFactory.create({
        creatorId: user.id,
        ownerId: user.id,
      })
      const dataset2 = await datasetFactory.create({
        creatorId: user.id,
        ownerId: user.id,
      })
      await datasetFactory.create({
        creatorId: user.id,
        ownerId: user.id,
      })
      const department1 = await userGroupFactory.create({
        type: UserGroupTypes.DEPARTMENT,
        name: "zzzzzzzzz",
      })
      const department2 = await userGroupFactory.create({
        type: UserGroupTypes.DEPARTMENT,
        name: "zzzzzzzzzzz",
      })
      const division1 = await userGroupFactory.create({
        type: UserGroupTypes.DIVISION,
        name: "zzzzzzzzzzz",
      })
      const division2 = await userGroupFactory.create({
        type: UserGroupTypes.DIVISION,
        name: "zzzzzzzzzz",
      })
      const branch1 = await userGroupFactory.create({
        type: UserGroupTypes.BRANCH,
        name: "aaa-bbb-ccc",
      })
      const branch2 = await userGroupFactory.create({
        type: UserGroupTypes.BRANCH,
        name: "bbb-ccc-ddd",
      })
      await datasetStewardshipFactory.create({
        datasetId: dataset1.id,
        ownerId: user.id,
        supportId: user.id,
        departmentId: department1.id,
        divisionId: division1.id,
        branchId: branch1.id,
      })
      await datasetStewardshipFactory.create({
        datasetId: dataset2.id,
        ownerId: user.id,
        supportId: user.id,
        departmentId: department2.id,
        divisionId: division2.id,
        branchId: branch2.id,
      })

      const searchToken = "bbb"

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
          id: dataset1.id,
        }),
        expect.objectContaining({
          id: dataset2.id,
        }),
      ])
    })

    test("when dataset stewardship unit name matches, returns the dataset", async () => {
      // Arrange
      const user = await userFactory.create()
      const dataset1 = await datasetFactory.create({
        creatorId: user.id,
        ownerId: user.id,
      })
      const dataset2 = await datasetFactory.create({
        creatorId: user.id,
        ownerId: user.id,
      })
      await datasetFactory.create({
        creatorId: user.id,
        ownerId: user.id,
      })
      const department1 = await userGroupFactory.create({
        type: UserGroupTypes.DEPARTMENT,
        name: "zzzzzzzzz",
      })
      const department2 = await userGroupFactory.create({
        type: UserGroupTypes.DEPARTMENT,
        name: "zzzzzzzzzzz",
      })
      const division1 = await userGroupFactory.create({
        type: UserGroupTypes.DIVISION,
        name: "zzzzzzzzzzz",
      })
      const division2 = await userGroupFactory.create({
        type: UserGroupTypes.DIVISION,
        name: "zzzzzzzzzz",
      })
      const branch1 = await userGroupFactory.create({
        type: UserGroupTypes.BRANCH,
        name: "zzzzzzzzzz",
      })
      const branch2 = await userGroupFactory.create({
        type: UserGroupTypes.BRANCH,
        name: "zzzzzzzzzz",
      })
      const unit1 = await userGroupFactory.create({
        type: UserGroupTypes.UNIT,
        name: "aaa-bbb-ccc",
      })
      const unit2 = await userGroupFactory.create({
        type: UserGroupTypes.UNIT,
        name: "bbb-ccc-ddd",
      })
      await datasetStewardshipFactory.create({
        datasetId: dataset1.id,
        ownerId: user.id,
        supportId: user.id,
        departmentId: department1.id,
        divisionId: division1.id,
        branchId: branch1.id,
        unitId: unit1.id,
      })
      await datasetStewardshipFactory.create({
        datasetId: dataset2.id,
        ownerId: user.id,
        supportId: user.id,
        departmentId: department2.id,
        divisionId: division2.id,
        branchId: branch2.id,
        unitId: unit2.id,
      })

      const searchToken = "bbb"

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
          id: dataset1.id,
        }),
        expect.objectContaining({
          id: dataset2.id,
        }),
      ])
    })

    test("when dataset stewardship department acronym matches exactly, returns the dataset", async () => {
      // Arrange
      const user = await userFactory.create()
      const dataset1 = await datasetFactory.create({
        creatorId: user.id,
        ownerId: user.id,
      })
      const dataset2 = await datasetFactory.create({
        creatorId: user.id,
        ownerId: user.id,
      })
      // await datasetFactory.create({
      //   creatorId: user.id,
      //   ownerId: user.id,
      // })
      const department1 = await userGroupFactory.create({
        type: UserGroupTypes.DEPARTMENT,
        name: "zzzzzzzzzzz",
        acronym: "AAA",
      })
      const department2 = await userGroupFactory.create({
        type: UserGroupTypes.DEPARTMENT,
        name: "zzzzzzzzzzzz",
        acronym: "AAABBB",
      })
      await datasetStewardshipFactory.create({
        datasetId: dataset1.id,
        ownerId: user.id,
        supportId: user.id,
        departmentId: department1.id,
      })
      await datasetStewardshipFactory.create({
        datasetId: dataset2.id,
        ownerId: user.id,
        supportId: user.id,
        departmentId: department2.id,
      })

      const searchToken = "AAA"

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
          id: dataset1.id,
        }),
      ])
    })
  })
})
