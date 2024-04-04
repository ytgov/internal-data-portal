import { CsvFormatterStream } from "fast-csv"
import { isArray, isEmpty, isNil, isUndefined } from "lodash"
import jmespath from "jmespath"

import { Dataset, DatasetIntegration, User } from "@/models"
import {
  DatasetIntegrationParsedJsonDataType,
  DatasetIntegrationRawJsonDataType,
} from "@/models/dataset-integration"

import BaseService from "@/services/base-service"

export class CreateService extends BaseService {
  constructor(
    private csvStream: CsvFormatterStream<string[], string[]>,
    private dataset: Dataset,
    private currentUser: User,
    private options: {
      searchToken?: string
    }
  ) {
    super()
  }

  async perform(): Promise<void> {
    const { integration, fields } = this.dataset

    if (isNil(integration)) {
      throw new Error("Dataset is missing an integration assocation")
    }

    if (isUndefined(fields)) {
      throw new Error("Dataset is missing fields association")
    }

    const headers = fields.map((field) => field.displayName)
    const headerKeys = fields.map((field) => field.name)
    this.csvStream.write(headers)

    const allRawJsonData = await integration.refresh()
    await integration.save()
    const parsedJsonData = this.parseJsonData(integration, allRawJsonData)

    const searchToken = this.options.searchToken

    parsedJsonData.forEach((entry) => {
      const dataFromFields = headerKeys.map((field) => entry[field])

      let dataFromSearch = dataFromFields
      if (!isNil(searchToken) && !isEmpty(searchToken)) {
        dataFromSearch = dataFromFields.filter((value) => this.matchesSearch(value, searchToken))
      }

      this.csvStream.write(dataFromSearch)
    })

    return
  }

  /**
   * Should match logic in api/src/models/dataset-entries/dataset-entries-search.ts
   */
  private matchesSearch(value: unknown, searchToken: string) {
    switch (typeof value) {
      case "string":
        return value.toLowerCase().includes(searchToken.toLowerCase())
      case "number":
        return value.toString() === searchToken.toLowerCase()
      default:
        return false
    }
  }

  private parseJsonData(
    datasetIntegration: DatasetIntegration,
    allRawJsonData: DatasetIntegrationRawJsonDataType
  ): DatasetIntegrationParsedJsonDataType {
    const { jmesPathTransform } = datasetIntegration

    if (isNil(jmesPathTransform) && isArray(allRawJsonData)) {
      return allRawJsonData
    }

    if (isNil(jmesPathTransform)) {
      throw new Error("An integration must parse to an array to be valid")
    }

    const parsedJsonData = jmespath.search(allRawJsonData, jmesPathTransform)
    return parsedJsonData
  }
}

export default CreateService
