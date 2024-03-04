import { DatasetField, DatasetEntry } from "@/models"

import { datasetEntryFactory, datasetFactory, datasetFieldFactory, userFactory } from "@/factories"

describe("api/src/models/dataset-entry.ts", () => {
  describe("DatasetEntry", () => {
    describe(".scope - search", () => {
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
        const scope = DatasetEntry.scope({ method: ["search", searchToken] })
        const result = await scope.findAll()

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
})
