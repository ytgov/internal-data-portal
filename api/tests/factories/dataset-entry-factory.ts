import { type DeepPartial } from "fishery"

import { DatasetEntry } from "@/models"

import BaseFactory from "@/factories/base-factory"
import { DatasetEntryJsonDataType } from "@/models/dataset-entry"

export const datasetEntryFactory = BaseFactory.define<DatasetEntry>(
  ({ sequence, params, onCreate }) => {
    onCreate((datasetField) => datasetField.save())

    assertParamsHasDatasetId(params)
    assertParamsHasJsonData(params)

    return DatasetEntry.build({
      id: sequence,
      datasetId: params.datasetId,
      rawJsonData: params.jsonData,
      jsonData: params.jsonData
    })
  }
)

function assertParamsHasDatasetId(
  params: DeepPartial<DatasetEntry>
): asserts params is DeepPartial<DatasetEntry> & { datasetId: number } {
  if (typeof params.datasetId !== "number") {
    throw new Error("datasetId is must be a number")
  }
}

function assertParamsHasJsonData(
  params: DeepPartial<DatasetEntry>
): asserts params is DeepPartial<DatasetEntry> & { jsonData: DatasetEntryJsonDataType } {
  if (typeof params.jsonData !== "object") {
    throw new Error("jsonData is must be an object")
  }
}

export default datasetEntryFactory
