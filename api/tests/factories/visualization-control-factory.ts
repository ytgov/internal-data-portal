import { faker } from "@faker-js/faker"
import { type DeepPartial } from "fishery"

import { VisualizationControl } from "@/models"

import BaseFactory from "@/factories/base-factory"

export const visualizationControlFactory = BaseFactory.define<VisualizationControl>(
  ({ sequence, params, onCreate }) => {
    onCreate((visualizationControl) => visualizationControl.save())

    assertParamsHasDatasetId(params)

    return VisualizationControl.build({
      id: sequence,
      datasetId: params.datasetId,
      isDownloadableAsCsv: faker.datatype.boolean(),
      hasPreview: faker.datatype.boolean(),
      hasFieldsExcludedFromPreview: faker.datatype.boolean(),
      hasPreviewRowLimit: faker.datatype.boolean(),
      previewRowLimit: faker.number.int({ min: 1, max: 100 }),
    })
  }
)

function assertParamsHasDatasetId(
  params: DeepPartial<VisualizationControl>
): asserts params is DeepPartial<VisualizationControl> & { datasetId: number } {
  if (typeof params.datasetId !== "number") {
    throw new Error("datasetId is must be a number")
  }
}

export default visualizationControlFactory
