import { DatasetField } from "@/models"
import { BulkReplaceDatasetFieldsService } from "@/services/dataset-integrations"
import { datasetFactory, datasetIntegrationFactory, userFactory } from "@/factories"

describe("api/src/services/dataset-integrations/bulk-replace-dataset-fields-service.ts", () => {
  describe("BulkReplaceDatasetFieldsService", () => {
    describe("#perform", () => {
      test("when provided a dataset integration with parsed json data, it creates dataset fields based on the first entry", async () => {
        // Arrange
        const user = await userFactory.create()
        const dataset = await datasetFactory.create({
          creatorId: user.id,
          ownerId: user.id,
        })
        const datasetIntegration = await datasetIntegrationFactory.create({
          datasetId: dataset.id,
          parsedJsonData: [
            {
              full_name: "Jordan.Knight",
              department: "Health and Social Services",
              email: "Jordan.Knight@yukon.ca",
              phone_office: "867-555-1234",
            },
            {
              full_name: "Alexandra.Smith",
              department: "Finance",
              email: "Alexandra.Smith@yukon.ca",
              phone_office: "867-555-5678",
            },
          ],
        })

        // Act
        const result = await BulkReplaceDatasetFieldsService.perform(datasetIntegration)

        // Assert
        expect(result).toHaveLength(4)
        expect(result).toEqual([
          expect.objectContaining({
            datasetId: datasetIntegration.datasetId,
            name: "full_name",
            displayName: "Full Name",
            dataType: DatasetField.DataTypes.TEXT,
          }),
          expect.objectContaining({
            datasetId: datasetIntegration.datasetId,
            name: "department",
            displayName: "Department",
            dataType: DatasetField.DataTypes.TEXT,
          }),
          expect.objectContaining({
            datasetId: datasetIntegration.datasetId,
            name: "email",
            displayName: "Email",
            dataType: DatasetField.DataTypes.TEXT,
          }),
          expect.objectContaining({
            datasetId: datasetIntegration.datasetId,
            name: "phone_office",
            displayName: "Phone Office",
            dataType: DatasetField.DataTypes.TEXT,
          }),
        ])
      })
    })
  })
})
