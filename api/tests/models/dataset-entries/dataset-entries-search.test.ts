import { Op } from "sequelize"

import { DatasetEntry, DatasetField } from "@/models"
import { datasetEntriesSearch } from "@/models/dataset-entries"

import { datasetEntryFactory, datasetFactory, datasetFieldFactory, userFactory } from "@/factories"

describe("api/src/models/dataset-entries/dataset-entries-search.ts", () => {
  describe(".datasetEntriesSearch", () => {
    test("when searching dataset entries, it includes the expected results", async () => {
      // Arrange
      const user = await userFactory.create()
      const dataset = await datasetFactory.create({
        creatorId: user.id,
        ownerId: user.id,
      })
      await datasetFieldFactory.create({
        datasetId: dataset.id,
        name: "email",
        dataType: DatasetField.DataTypes.TEXT,
      })
      const datasetEntry1 = await datasetEntryFactory.create({
        datasetId: dataset.id,
        jsonData: { email: "Marlen@test.com" },
      })
      const datasetEntry2 = await datasetEntryFactory.create({
        datasetId: dataset.id,
        jsonData: { email: "Mark@test.com" },
      })
      await datasetEntryFactory.create({
        datasetId: dataset.id,
        jsonData: { email: "Mandy@test.com" },
      })

      // Act
      const searchToken = "Mar"
      const query = datasetEntriesSearch()
      const scope = DatasetEntry.scope({
        where: { id: { [Op.in]: query } },
      })
      const result = await scope.findAll({
        replacements: { searchTokenWildcard: `%${searchToken}%`, searchToken },
      })

      // Assert
      expect.assertions(1)
      expect(result).toEqual([
        expect.objectContaining({
          jsonData: expect.objectContaining({
            email: datasetEntry1.jsonData.email,
          }),
        }),
        expect.objectContaining({
          jsonData: expect.objectContaining({
            email: datasetEntry2.jsonData.email,
          }),
        }),
      ])
    })
  })
})
