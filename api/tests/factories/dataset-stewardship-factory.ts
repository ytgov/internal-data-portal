import { DeepPartial } from "fishery"

import { DatasetStewardship } from "@/models"
import BaseFactory from "@/factories/base-factory"

export const datasetStewardshipFactory = BaseFactory.define<DatasetStewardship>(
  ({ sequence, params, onCreate }) => {
    onCreate((datasetStewardship) => datasetStewardship.save())

    assertParamsHasDatasetId(params)
    assertParamsHasOnwerId(params)
    assertParamsHasSupportId(params)
    assertParamsHasDepartmentId(params)

    return DatasetStewardship.build({
      id: sequence,
      datasetId: params.datasetId, // does not unbrand and cast datasetId to number
      ownerId: params.ownerId,
      supportId: params.supportId,
      departmentId: params.departmentId,
    })
  }
)

export default datasetStewardshipFactory

function assertParamsHasDatasetId(
  params: DeepPartial<DatasetStewardship>
): asserts params is DeepPartial<DatasetStewardship> & { datasetId: number } {
  if (typeof params.datasetId !== "number") {
    throw new Error("datasetId is must be a number")
  }
}

function assertParamsHasOnwerId(
  params: DeepPartial<DatasetStewardship>
): asserts params is DeepPartial<DatasetStewardship> & { ownerId: number } {
  if (typeof params.ownerId !== "number") {
    throw new Error("ownerId is must be a number")
  }
}

function assertParamsHasSupportId(
  params: DeepPartial<DatasetStewardship>
): asserts params is DeepPartial<DatasetStewardship> & { supportId: number } {
  if (typeof params.supportId !== "number") {
    throw new Error("supportId is must be a number")
  }
}

function assertParamsHasDepartmentId(
  params: DeepPartial<DatasetStewardship>
): asserts params is DeepPartial<DatasetStewardship> & { departmentId: number } {
  if (typeof params.departmentId !== "number") {
    throw new Error("departmentId is must be a number")
  }
}
