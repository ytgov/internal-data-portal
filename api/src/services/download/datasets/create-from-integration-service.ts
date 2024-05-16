import { CsvFormatterStream } from "fast-csv"
import { isArray, isEmpty, isNil, isString } from "lodash"
import { search } from "jmespath"

import { DatasetField, DatasetIntegration, User } from "@/models"
import {
  DEFAULT_KEY,
  DatasetIntegrationParsedJsonDataType,
  DatasetIntegrationRawJsonDataType,
} from "@/models/dataset-integration"
import { DatasetIntegrations } from "@/services"

import BaseService from "@/services/base-service"

export class CreateFromIntegrationService extends BaseService {
  constructor(
    private csvStream: CsvFormatterStream<string[], string[]>,
    private datasetIntegration: DatasetIntegration,
    private datasetFields: DatasetField[],
    private currentUser: User,
    private options: {
      searchToken?: string
    }
  ) {
    super()
  }

  async perform(): Promise<void> {
    const headers = this.datasetFields.map((field) => field.displayName)
    const headerKeys = this.datasetFields.map((field) => field.name)
    this.csvStream.write(headers)

    const allRawJsonData = await DatasetIntegrations.RefreshService.perform(this.datasetIntegration)
    await this.datasetIntegration.save()

    const parsedAndNormalizedJsonData = this.applyJMESPathTransformAndNormalize(
      this.datasetIntegration,
      allRawJsonData
    )
    this.assertSelfConsistentDataStructure(parsedAndNormalizedJsonData, headerKeys)

    let filteredData = parsedAndNormalizedJsonData
    const searchToken = this.options.searchToken
    if (!isNil(searchToken) && !isEmpty(searchToken)) {
      filteredData = this.filterData(parsedAndNormalizedJsonData, headerKeys, searchToken)
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

  private assertSelfConsistentDataStructure(
    parsedJsonData: DatasetIntegrationParsedJsonDataType,
    headerKeys: string[]
  ): void {
    if (headerKeys.length === 0) {
      throw new Error("Header keys array is empty")
    }

    const firstEntry = parsedJsonData[0]
    if (isNil(firstEntry)) {
      throw new Error("Parsed JSON data is empty")
    }

    if (typeof firstEntry !== "object") {
      throw new Error("Parsed JSON data is not an object")
    }

    const firstEntryKeys = Object.keys(firstEntry)
    const allKeysPresent = headerKeys.every((key) => firstEntryKeys.includes(key))
    if (allKeysPresent === false) {
      throw new Error("There is a mismatch between header keys and parsed JSON data keys.")
    }

    return
  }

  private applyJMESPathTransformAndNormalize(
    datasetIntegration: DatasetIntegration,
    allRawJsonData: DatasetIntegrationRawJsonDataType
  ): DatasetIntegrationParsedJsonDataType {
    const { jmesPathTransform } = datasetIntegration

    if (isNil(allRawJsonData)) {
      throw new Error("An integration must have data to be parsed.")
    }

    let searchedAllRawJsonData = allRawJsonData
    if (!isNil(jmesPathTransform)) {
      searchedAllRawJsonData = search(allRawJsonData, jmesPathTransform)
    }

    if (!isArray(searchedAllRawJsonData)) {
      throw new Error("An integration must parse to an array to be valid")
    }

    if (searchedAllRawJsonData.every(isString)) {
      return searchedAllRawJsonData.map((value) => ({ [DEFAULT_KEY]: value }))
    }

    return searchedAllRawJsonData
  }
}

export default CreateFromIntegrationService
