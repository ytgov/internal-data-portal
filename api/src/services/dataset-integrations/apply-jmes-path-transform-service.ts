import { isArray, isNil } from "lodash"
import { search } from "jmespath"

import DatasetIntegration from "@/models/dataset-integration"

import BaseService from "@/services/base-service"

export class ApplyJMESPathTransformService extends BaseService {
  constructor(private datasetIntegration: DatasetIntegration) {
    super()
  }

  async perform(): Promise<DatasetIntegration> {
    const { rawJsonData, jmesPathTransform } = this.datasetIntegration

    if (isNil(rawJsonData)) {
      throw new Error("An integration must have data to be parsed.")
    }

    if (isNil(jmesPathTransform) && isArray(rawJsonData)) {
      return this.datasetIntegration.set({
        parsedJsonData: rawJsonData,
      })
    }

    if (isNil(jmesPathTransform)) {
      throw new Error("An integration must parse to an array to be valid")
    }

    const parsedJsonData = search(rawJsonData, jmesPathTransform)
    return this.datasetIntegration.set({
      parsedJsonData,
    })
  }
}
