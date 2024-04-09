import { faker } from "@faker-js/faker"
import { times } from "lodash"

import { DatasetIntegrationStatusTypes, MAX_RECORDS } from "@/models/dataset-integration"
import { ActivateService } from "@/services/dataset-integrations"

import { datasetFactory, datasetIntegrationFactory, userFactory } from "@/factories"

import { mockedAxios } from "@/support"

describe("api/src/services/dataset-integrations/activate-service.ts", () => {
  describe("ActivateService#perform", () => {
    test("when data format is standard array of objects with count, it fetches and stores data", async () => {
      // Arrange
      const user = await userFactory.create()
      const dataset = await datasetFactory.create({
        ownerId: user.id,
        creatorId: user.id,
      })
      const datasetIntegration = datasetIntegrationFactory.build({
        datasetId: dataset.id,
        url: "https://api.gov.yk.ca/directory/employees",
        status: DatasetIntegrationStatusTypes.PENDING,
        headerKey: "Ocp-Apim-Subscription-Key",
        headerValue: "1234567890",
      })

      const count = 150 // greater than MAX_RECORDS
      const data = {
        employees: times(count, () => ({
          email: faker.internet.email(),
        })),
        count,
      }

      mockedAxios
        .onGet(
          "https://api.gov.yk.ca/directory/employees",
          undefined,
          expect.objectContaining({ "Ocp-Apim-Subscription-Key": "1234567890" })
        )
        .replyOnce(200, data, {
          "content-length": "5528",
        })

      // Act
      const allRawJsonData = await ActivateService.perform(datasetIntegration)

      // Assert
      expect(count).toBeGreaterThan(MAX_RECORDS)
      expect(datasetIntegration.status).toEqual(DatasetIntegrationStatusTypes.OK)
      expect(datasetIntegration.rawJsonData).toEqual({
        employees: data.employees.slice(0, MAX_RECORDS),
        count,
      })
      expect(datasetIntegration.estimatedResponseTimeInMs).toBeGreaterThan(0)
      expect(datasetIntegration.estimatedSizeInBytes).toEqual(5528)
      expect(datasetIntegration.estimatedNumberOfRecords).toEqual(count)
      expect(datasetIntegration.lastSuccessAt).toBeInstanceOf(Date)
      expect(allRawJsonData).toEqual(data)
    })
  })
})
