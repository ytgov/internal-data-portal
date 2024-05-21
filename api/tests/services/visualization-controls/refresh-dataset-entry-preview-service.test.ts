import { RefreshDatasetEntryPreviewService } from "@/services/visualization-controls"
import {
  datasetEntryFactory,
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
          }
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
    })
  })
})
