import { isNil } from "lodash"
import axios from "axios"

import countDeep from "@/utils/count-deep"
import truncateDeep from "@/utils/truncate-deep"

import { DatasetIntegration, User } from "@/models"
import {
  DatasetIntegrationRawJsonDataType,
  DatasetIntegrationStatusTypes,
} from "@/models/dataset-integration"

import BaseService from "@/services/base-service"

type Attributes = Partial<DatasetIntegration>

const MAX_RECORDS = 100 // TODO: consider making this configurable?

export class CreateService extends BaseService {
  constructor(
    private attributes: Attributes,
    private currentUser: User
  ) {
    super()
  }

  async perform(): Promise<DatasetIntegration> {
    const { datasetId, url, ...optionalAttributes } = this.attributes

    if (isNil(datasetId)) {
      throw new Error("datasetId is required")
    }

    if (isNil(url)) {
      throw new Error("url is required")
    }

    let headers = {}
    if (!isNil(optionalAttributes.headerKey)) {
      headers = {
        [optionalAttributes.headerKey]: optionalAttributes.headerValue,
      }
    }

    let status: DatasetIntegrationStatusTypes
    let rawJsonData: DatasetIntegrationRawJsonDataType | null = null
    let estimatedResponseTimeInMs: number | null = null
    let estimatedSizeInBytes: number | null = null
    let estimatedNumberOfRecords: number | null = null
    let lastSuccessAt: Date | null = null
    try {
      ;({ rawJsonData, estimatedResponseTimeInMs, estimatedSizeInBytes, estimatedNumberOfRecords } =
        await this.fetchRawIntegrationData(url, headers))
      status = DatasetIntegrationStatusTypes.OK
      lastSuccessAt = new Date()
    } catch (error) {
      throw new Error(`Failed to establish integration with ${url}: ${error}`)
    }

    const datasetIntegration = await DatasetIntegration.create({
      datasetId,
      url,
      ...optionalAttributes,
      status,
      rawJsonData,
      estimatedResponseTimeInMs,
      estimatedSizeInBytes,
      estimatedNumberOfRecords,
      lastSuccessAt,
    })

    // TODO: log creating user

    return datasetIntegration
  }

  private async fetchRawIntegrationData(
    url: string,
    headers?: Record<string, string>
  ): Promise<{
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

export default CreateService
