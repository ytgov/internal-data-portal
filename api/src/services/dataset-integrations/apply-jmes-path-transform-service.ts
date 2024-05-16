import { isArray, isNil } from "lodash"
import { search } from "jmespath"

import isStringArray from "@/utils/is-string-array"
import DatasetIntegration, {
  DEFAULT_KEY,
  DatasetIntegrationParsedJsonDataType,
} from "@/models/dataset-integration"

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

    let searchedRawJsonData = rawJsonData
    if (!isNil(jmesPathTransform)) {
      searchedRawJsonData = search(rawJsonData, jmesPathTransform)
    }

    if (!isArray(searchedRawJsonData)) {
      throw new Error("An integration must parse to an array to be valid")
    }

    const normalizedData = this.nomalizeData(searchedRawJsonData)
    await this.datasetIntegration.update({
      parsedJsonData: normalizedData,
    })

    return this.datasetIntegration
  }

  private nomalizeData(
    rawJsonData: string[] | Record<string, unknown>[]
  ): DatasetIntegrationParsedJsonDataType {
    if (isStringArray(rawJsonData)) {
      return rawJsonData.map((value) => ({
        [DEFAULT_KEY]: value,
      }))
    }

    return rawJsonData
  }
}
