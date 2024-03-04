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

    test("when searching dataset entries, does not include results from excluded columsn", async () => {
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
        isExcludedFromSearch: true,
      })
      await datasetFieldFactory.create({
        datasetId: dataset.id,
        name: "firstName",
        dataType: DatasetField.DataTypes.TEXT,
      })
      await datasetEntryFactory.create({
        datasetId: dataset.id,
        jsonData: { email: "mbrunner@test.com", firstName: "Marlen" },
      })
      await datasetEntryFactory.create({
        datasetId: dataset.id,
        jsonData: { email: "mdoe@test.com", firstName: "Mark" },
      })
      const datasetEntry1 = await datasetEntryFactory.create({
        datasetId: dataset.id,
        jsonData: { email: "m.doe@test.com", firstName: "Test" },
      })

      // Act
      const searchToken = "test"
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
      ])
    })

    test("when searching dataset entries, when token is an exact match, it includes results from integer columns", async () => {
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
      await datasetFieldFactory.create({
        datasetId: dataset.id,
        name: "age",
        dataType: DatasetField.DataTypes.INTEGER,
      })
      const datasetEntry1 = await datasetEntryFactory.create({
        datasetId: dataset.id,
        jsonData: { email: "Marlen@test.com", age: 33 },
      })
      const datasetEntry2 = await datasetEntryFactory.create({
        datasetId: dataset.id,
        jsonData: { email: "Mark@test.com", age: 33 },
      })
      await datasetEntryFactory.create({
        datasetId: dataset.id,
        jsonData: { email: "Mandy@test.com", age: 333 },
      })

      // Act
      const searchToken = "33"
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

    test("when multiple columns have matches, it returns them all", async () => {
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
      await datasetFieldFactory.create({
        datasetId: dataset.id,
        name: "fullName",
        dataType: DatasetField.DataTypes.TEXT,
      })
      const datasetEntry1 = await datasetEntryFactory.create({
        datasetId: dataset.id,
        jsonData: { email: "Marlen@test.com", fullName: "Marlen Brunner" },
      })
      const datasetEntry2 = await datasetEntryFactory.create({
        datasetId: dataset.id,
        jsonData: { email: "Mark.Doe@test.com", fullName: "Mark Doe" },
      })
      const datasetEntry3 = await datasetEntryFactory.create({
        datasetId: dataset.id,
        jsonData: { email: "Mandy.m@test.com", fullName: "Mandy Mark" },
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
        expect.objectContaining({
          jsonData: expect.objectContaining({
            email: datasetEntry3.jsonData.email,
          }),
        }),
      ])
    })
  })
})
