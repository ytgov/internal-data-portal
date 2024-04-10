import axios from "axios"
import { isNil } from "lodash"

import countDeep from "@/utils/count-deep"
import truncateDeep from "@/utils/truncate-deep"
import { DatasetIntegration } from "@/models"
import {
  DatasetIntegrationRawJsonDataType,
  DatasetIntegrationStatusTypes,
  MAX_RECORDS,
} from "@/models/dataset-integration"

import BaseService from "@/services/base-service"

export class ActivateService extends BaseService {
  constructor(private datasetIntegration: DatasetIntegration) {
    super()
  }

  async perform(): Promise<DatasetIntegrationRawJsonDataType> {
    const { url, headerKey, headerValue } = this.datasetIntegration

    if (isNil(url)) {
      throw new Error("url is required")
    }

    let headers = {}
    if (!isNil(headerKey)) {
      headers = {
        [headerKey]: headerValue,
      }
    }

    let {
      rawJsonData,
      estimatedResponseTimeInMs,
      estimatedSizeInBytes,
      estimatedNumberOfRecords,
      status,
      lastSuccessAt,
    } = this.datasetIntegration
    let allRawJsonData: DatasetIntegrationRawJsonDataType | null = null
    try {
      ;({
        allRawJsonData,
        rawJsonData,
        estimatedResponseTimeInMs,
        estimatedSizeInBytes,
        estimatedNumberOfRecords,
      } = await this.fetchRawIntegrationData(url, headers))
      status = DatasetIntegrationStatusTypes.OK
      lastSuccessAt = new Date()
    } catch (error) {
      throw new Error(`Failed to establish integration with ${url}: ${error}`)
    }

    this.datasetIntegration.set({
      status,
      rawJsonData,
      estimatedResponseTimeInMs,
      estimatedSizeInBytes,
      estimatedNumberOfRecords,
      lastSuccessAt,
    })
    await this.datasetIntegration.save()

    return allRawJsonData
  }

  private async fetchRawIntegrationData(
    url: string,
    headers?: Record<string, string>
  ): Promise<{
    allRawJsonData: DatasetIntegrationRawJsonDataType
    rawJsonData: DatasetIntegrationRawJsonDataType
    estimatedResponseTimeInMs: number
    estimatedSizeInBytes: number
    estimatedNumberOfRecords: number
  }> {
    const startTimeMs = new Date().getTime()
    const { data, headers: responseHeaders } = await axios.get(url, {
      headers,
    })
    const endTimeMs = new Date().getTime()
    const estimatedResponseTimeInMs = endTimeMs - startTimeMs

    const estimatedSizeInBytes = this.estimateSizeInBytes(data, responseHeaders["content-length"])
    const estimatedNumberOfRecords = this.estimateNumberOfRecords(data)

    const truncatedData = truncateDeep(data, MAX_RECORDS)

    return {
      allRawJsonData: data,
      rawJsonData: truncatedData,
      estimatedResponseTimeInMs,
      estimatedSizeInBytes,
      estimatedNumberOfRecords,
    }
  }

  private estimateSizeInBytes(data: object, contentLength?: string): number {
    if (contentLength) {
      return parseInt(contentLength, 10)
    }

    return new TextEncoder().encode(JSON.stringify(data)).length
  }

  private estimateNumberOfRecords(data: object): number {
    if (
      typeof data === "object" &&
      !isNil(data) &&
      "count" in data &&
      typeof data.count === "number"
    ) {
      return data.count
    }

    return countDeep(data)
  }
}
