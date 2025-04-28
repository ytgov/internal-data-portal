import { faker } from "@faker-js/faker"
import { type DeepPartial } from "fishery"

import { DatasetIntegration } from "@/models"
import { DatasetIntegrationStatusTypes } from "@/models/dataset-integration"

import BaseFactory from "@/factories/base-factory"

function assertParamsHasDatasetId(
  params: DeepPartial<DatasetIntegration>
): asserts params is DeepPartial<DatasetIntegration> & { datasetId: number } {
  if (typeof params.datasetId !== "number") {
    throw new Error("datasetId is must be a number")
  }
}

export const datasetIntegrationFactory = BaseFactory.define<DatasetIntegration>(
  ({ sequence, params, onCreate }) => {
    onCreate((datasetIntegration) => datasetIntegration.save())

    assertParamsHasDatasetId(params)

    return DatasetIntegration.build({
      id: sequence,
      datasetId: params.datasetId,
      url: faker.internet.url(),
      status: faker.helpers.enumValue(DatasetIntegrationStatusTypes),
    })
  }
)

export default datasetIntegrationFactory
