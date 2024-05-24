import { faker } from "@faker-js/faker"
import { Op } from "sequelize"

import { DatasetEntryPreview } from "@/models"
import { RefreshDatasetEntryPreviewService } from "@/services/visualization-controls"
import {
  datasetEntryFactory,
  datasetEntryPreviewFactory,
  datasetFactory,
  datasetFieldFactory,
  userFactory,
  visualizationControlFactory,
} from "@/factories"

describe("api/src/services/visualization-controls/refresh-dataset-entry-preview-service.ts", () => {
  describe("RefreshDatasetEntryPreviewService", () => {
    describe("#perform", () => {
      test("when dataset entry preview is refreshed, it includes all fields that are not excluded from preview", async () => {
        // Arrange
        const user = await userFactory.create()
        const dataset = await datasetFactory.create({
          creatorId: user.id,
          ownerId: user.id,
        })
        const visualizationControl = await visualizationControlFactory.create({
          datasetId: dataset.id,
          hasFieldsExcludedFromPreview: true,
        })
        await datasetFieldFactory.create({
          datasetId: dataset.id,
          name: "field1",
          isExcludedFromPreview: false,
        })
        await datasetFieldFactory.create({
          datasetId: dataset.id,
          name: "field2",
          isExcludedFromPreview: false,
        })
        await datasetFieldFactory.create({
          datasetId: dataset.id,
          name: "field3",
          isExcludedFromPreview: true,
        })
        const datasetEntry1 = await datasetEntryFactory.create({
          datasetId: dataset.id,
          jsonData: {
            field1: "value1",
            field2: "value2",
            field3: "value3",
          },
        })
        const datasetEntry2 = await datasetEntryFactory.create({
          datasetId: dataset.id,
          jsonData: {
            field1: "value4",
            field2: "value5",
            field3: "value6",
          },
        })
        const datasetEntry3 = await datasetEntryFactory.create({
          datasetId: dataset.id,
          jsonData: {
            field1: "value7",
            field2: "value8",
            field3: "value9",
          },
        })

        // Act
        const result = await RefreshDatasetEntryPreviewService.perform(visualizationControl, user)

        // Assert
        expect(result.map((r) => r.dataValues)).toEqual([
          expect.objectContaining({
            datasetId: visualizationControl.datasetId,
            datasetEntryId: datasetEntry1.id,
            jsonData: JSON.stringify({
              field1: "value1",
              field2: "value2",
            }),
          }),
          expect.objectContaining({
            datasetId: visualizationControl.datasetId,
            datasetEntryId: datasetEntry2.id,
            jsonData: JSON.stringify({
              field1: "value4",
              field2: "value5",
            }),
          }),
          expect.objectContaining({
            datasetId: visualizationControl.datasetId,
            datasetEntryId: datasetEntry3.id,
            jsonData: JSON.stringify({
              field1: "value7",
              field2: "value8",
            }),
          }),
        ])
      })

      test("when all fields that are excluded from preview, it returns an empty array", async () => {
        // Arrange
        const user = await userFactory.create()
        const dataset = await datasetFactory.create({
          creatorId: user.id,
          ownerId: user.id,
        })
        const visualizationControl = await visualizationControlFactory.create({
          datasetId: dataset.id,
          hasFieldsExcludedFromPreview: true,
        })
        await datasetFieldFactory.create({
          datasetId: dataset.id,
          name: "field1",
          isExcludedFromPreview: true,
        })
        await datasetEntryFactory.create({
          datasetId: dataset.id,
          jsonData: {
            field1: "value1",
          },
        })

        // Act
        const result = await RefreshDatasetEntryPreviewService.perform(visualizationControl, user)

        // Assert
        expect(result).toEqual([])
      })

      test("when dataset entry previews exist, they are deleted before creating new ones", async () => {
        const user = await userFactory.create()
        const dataset = await datasetFactory.create({
          creatorId: user.id,
          ownerId: user.id,
        })
        const visualizationControl = await visualizationControlFactory.create({
          datasetId: dataset.id,
          hasFieldsExcludedFromPreview: true,
        })
        await datasetFieldFactory.create({
          datasetId: dataset.id,
          name: "field1",
          isExcludedFromPreview: false,
        })
        await datasetFieldFactory.create({
          datasetId: dataset.id,
          name: "field2",
          isExcludedFromPreview: false,
        })
        const datasetEntry1 = await datasetEntryFactory.create({
          datasetId: dataset.id,
          jsonData: {
            field1: "value1",
            field2: "value2",
            field3: "value3",
          },
        })
        const datasetEntry2 = await datasetEntryFactory.create({
          datasetId: dataset.id,
          jsonData: {
            field1: "value4",
            field2: "value5",
            field3: "value6",
          },
        })
        const datasetEntryPreview1 = await datasetEntryPreviewFactory.create({
          datasetId: visualizationControl.datasetId,
          datasetEntryId: datasetEntry1.id,
          jsonData: { field1: "value1" },
        })
        const datasetEntryPreview2 = await datasetEntryPreviewFactory.create({
          datasetId: visualizationControl.datasetId,
          datasetEntryId: datasetEntry2.id,
          jsonData: { field1: "value4" },
        })

        // Act
        await RefreshDatasetEntryPreviewService.perform(visualizationControl, user)

        // Assert
        const deletedDatasetEntryPreviews = await DatasetEntryPreview.findAll({
          where: { deletedAt: { [Op.not]: null } },
          paranoid: false,
        })
        expect(deletedDatasetEntryPreviews.length).toEqual(2)
        expect(deletedDatasetEntryPreviews.map((m) => m.dataValues)).toEqual([
          expect.objectContaining({
            id: datasetEntryPreview1.id,
            datasetId: visualizationControl.datasetId,
            datasetEntryId: datasetEntry1.id,
            jsonData: JSON.stringify({ field1: "value1" }),
          }),
          expect.objectContaining({
            id: datasetEntryPreview2.id,
            datasetId: visualizationControl.datasetId,
            datasetEntryId: datasetEntry2.id,
            jsonData: JSON.stringify({ field1: "value4" }),
          }),
        ])
        const datasetEntryPreviews = await DatasetEntryPreview.findAll()
        expect(datasetEntryPreviews.length).toBe(2)
        expect(datasetEntryPreviews.map((m) => m.dataValues)).toEqual([
          expect.objectContaining({
            datasetId: visualizationControl.datasetId,
            datasetEntryId: datasetEntry1.id,
            jsonData: JSON.stringify({
              field1: "value1",
              field2: "value2",
            }),
          }),
          expect.objectContaining({
            datasetId: visualizationControl.datasetId,
            datasetEntryId: datasetEntry2.id,
            jsonData: JSON.stringify({
              field1: "value4",
              field2: "value5",
            }),
          }),
        ])
      })

      test("when visualization control preview row limit is enabled, it limits preview results", async () => {
        const user = await userFactory.create()
        const dataset = await datasetFactory.create({
          creatorId: user.id,
          ownerId: user.id,
        })
        const visualizationControl = await visualizationControlFactory.create({
          datasetId: dataset.id,
          hasPreviewRowLimit: true,
          previewRowLimit: 10,
        })
        await datasetFieldFactory.create({
          datasetId: dataset.id,
          name: "field1",
          isExcludedFromPreview: false,
        })
        await datasetEntryFactory.createList(12, {
          datasetId: dataset.id,
          jsonData: {
            field1: faker.lorem.word(),
          },
        })

        // Act
        const result = await RefreshDatasetEntryPreviewService.perform(visualizationControl, user)

        // Assert
        expect(result.length).toBe(10)
      })

      test("when visualization control has field exclusions disabled, it includes all fields in preview", async () => {
        // Arrange
        const user = await userFactory.create()
        const dataset = await datasetFactory.create({
          creatorId: user.id,
          ownerId: user.id,
        })
        const visualizationControl = await visualizationControlFactory.create({
          datasetId: dataset.id,
          hasFieldsExcludedFromPreview: false,
        })
        await datasetFieldFactory.create({
          datasetId: dataset.id,
          name: "field1",
          isExcludedFromPreview: true,
        })
        await datasetFieldFactory.create({
          datasetId: dataset.id,
          name: "field2",
          isExcludedFromPreview: false,
        })
        const datasetEntry1 = await datasetEntryFactory.create({
          datasetId: dataset.id,
          jsonData: {
            field1: "value1",
            field2: "value2",
            field3: "value3",
          },
        })
        const datasetEntry2 = await datasetEntryFactory.create({
          datasetId: dataset.id,
          jsonData: {
            field1: "value4",
            field2: "value5",
            field3: "value6",
          },
        })

        // Act
        const result = await RefreshDatasetEntryPreviewService.perform(visualizationControl, user)

        // Assert
        expect(result.map((r) => r.dataValues)).toEqual([
          expect.objectContaining({
            datasetId: visualizationControl.datasetId,
            datasetEntryId: datasetEntry1.id,
            jsonData: JSON.stringify({
              field1: "value1",
              field2: "value2",
            }),
          }),
          expect.objectContaining({
            datasetId: visualizationControl.datasetId,
            datasetEntryId: datasetEntry2.id,
            jsonData: JSON.stringify({
              field1: "value4",
              field2: "value5",
            }),
          }),
        ])
      })

      test("when visualization control preview row limit is disabled, it includes all entries in preview", async () => {
        const user = await userFactory.create()
        const dataset = await datasetFactory.create({
          creatorId: user.id,
          ownerId: user.id,
        })
        const visualizationControl = await visualizationControlFactory.create({
          datasetId: dataset.id,
          hasPreviewRowLimit: false,
          previewRowLimit: 10,
        })
        await datasetFieldFactory.create({
          datasetId: dataset.id,
          name: "field1",
          isExcludedFromPreview: false,
        })
        await datasetEntryFactory.createList(12, {
          datasetId: dataset.id,
          jsonData: {
            field1: faker.lorem.word(),
          },
        })

        // Act
        const result = await RefreshDatasetEntryPreviewService.perform(visualizationControl, user)

        // Assert
        expect(result.length).toBe(12)
      })
    })
  })
})
