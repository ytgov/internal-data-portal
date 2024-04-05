import { CsvFormatterStream } from "fast-csv"
import { isArray, isEmpty, isNil, isString, isUndefined } from "lodash"
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
    const normalizedData = this.nomalizeData(parsedJsonData, headerKeys)

    let filteredData = normalizedData
    const searchToken = this.options.searchToken
    if (!isNil(searchToken) && !isEmpty(searchToken)) {
      filteredData = this.filterData(normalizedData, headerKeys, searchToken)
    }

    for (const entry of filteredData) {
      const dataFromFields = headerKeys.map((field) => entry[field])
      this.csvStream.write(dataFromFields)
    }

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

  private filterData(
    parsedJsonData: DatasetIntegrationParsedJsonDataType,
    headerKeys: string[],
    searchToken: string
  ): DatasetIntegrationParsedJsonDataType {
    return parsedJsonData.filter((entry) => {
      return headerKeys.some((key) => {
        const value = entry[key]
        return this.matchesSearch(value, searchToken)
      })
    })
  }

  private nomalizeData(
    parsedJsonData: DatasetIntegrationParsedJsonDataType,
    headerKeys: string[]
  ): DatasetIntegrationParsedJsonDataType {
    if (headerKeys.length === 0) {
      throw new Error("Header keys array is empty")
    }

    const firstEntry = parsedJsonData[0]
    if (isNil(firstEntry)) {
      throw new Error("Parsed JSON data is empty")
    }

    const isSimpleStringArray = isString(firstEntry) && headerKeys.length === 1
    if (isSimpleStringArray) {
      const firstHeaderKey = headerKeys[0]
      return parsedJsonData.map((value) => ({ [firstHeaderKey]: value }))
    }

    if (typeof firstEntry !== "object") {
      throw new Error("Parsed JSON data is not an object")
    }

    const firstEntryKeys = Object.keys(firstEntry)
    const allKeysPresent = headerKeys.every((key) => firstEntryKeys.includes(key))
    if (allKeysPresent === false) {
      throw new Error("There is a mismatch between header keys and parsed JSON data keys.")
    }

    return parsedJsonData
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
