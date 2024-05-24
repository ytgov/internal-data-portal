import { type DeepPartial } from "fishery"

import { DatasetEntryPreview } from "@/models"
import { DatasetEntryJsonDataType } from "@/models/dataset-entry"

import BaseFactory from "@/factories/base-factory"

export const datasetEntryPreviewFactory = BaseFactory.define<DatasetEntryPreview>(
  ({ sequence, params, onCreate }) => {
    onCreate((datasetEntryPreview) => datasetEntryPreview.save())

    assertParamsHasDatasetId(params)
    assertParamsHasJsonData(params)

    return DatasetEntryPreview.build({
      id: sequence,
      datasetId: params.datasetId,
      jsonData: params.jsonData,
    })
  }
)

function assertParamsHasDatasetId(
  params: DeepPartial<DatasetEntryPreview>
): asserts params is DeepPartial<DatasetEntryPreview> & { datasetId: number } {
  if (typeof params.datasetId !== "number") {
    throw new Error("datasetId is must be a number")
  }
}

function assertParamsHasJsonData(
  params: DeepPartial<DatasetEntryPreview>
): asserts params is DeepPartial<DatasetEntryPreview> & { jsonData: DatasetEntryJsonDataType } {
  if (typeof params.jsonData !== "object") {
    throw new Error("jsonData is must be an object")
  }
}

export default datasetEntryPreviewFactory
