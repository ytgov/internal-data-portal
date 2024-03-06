import { Op } from "sequelize"

import { Dataset } from "@/models"
import { datasetsAccessibleViaOwner } from "@/models/datasets"

import { datasetFactory, userFactory } from "@/factories"

describe("api/src/models/datasets/datasets-accessible-via-owner.ts", () => {
  describe(".datasetsAccessibleViaOwner", () => {
    test("when dataset belongs to owner, it is returned", async () => {
      const datasetOwner = await userFactory.create()
      const otherUser = await userFactory.create()

      const accessibleDataset = await datasetFactory.create({
        creatorId: datasetOwner.id,
        ownerId: datasetOwner.id,
      })
      // inaccessibleDataset - for control case
      await datasetFactory.create({
        creatorId: otherUser.id,
        ownerId: otherUser.id,
      })

      // Act
      const query = datasetsAccessibleViaOwner(datasetOwner)
      const scope = Dataset.scope({ where: { id: { [Op.in]: query } } })
      const result = await scope.findAll()

      // Assert
      expect(result).toEqual([
        expect.objectContaining({
          id: accessibleDataset.id,
        }),
      ])
    })

    test("when dataset does not belong to owner, it is not returned", async () => {
      const datasetOwner = await userFactory.create()
      const otherUser = await userFactory.create()

      // inaccessible Dataset
      await datasetFactory.create({
        creatorId: otherUser.id,
        ownerId: otherUser.id,
      })

      // Act
      const query = datasetsAccessibleViaOwner(datasetOwner)
      const scope = Dataset.scope({ where: { id: { [Op.in]: query } } })
      const result = await scope.findAll()

      // Assert
      expect(result).toHaveLength(0)
    })
  })
})
