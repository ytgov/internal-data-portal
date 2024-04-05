import axios from "axios"
import { isNil } from "lodash"

import truncateDeep from "@/utils/truncate-deep"
import countDeep from "@/utils/count-deep"

import DatasetIntegration, {
  DatasetIntegrationStatusTypes,
  type DatasetIntegrationRawJsonDataType,
  MAX_RECORDS,
} from "@/models/dataset-integration"

export async function activate(
  datasetIntegration: DatasetIntegration
): Promise<DatasetIntegrationRawJsonDataType> {
  const { url, headerKey, headerValue } = datasetIntegration

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
  } = datasetIntegration
  let allRawJsonData: DatasetIntegrationRawJsonDataType | null = null
  try {
    ;({
      allRawJsonData,
      rawJsonData,
      estimatedResponseTimeInMs,
      estimatedSizeInBytes,
      estimatedNumberOfRecords,
    } = await fetchRawIntegrationData(url, headers))
    status = DatasetIntegrationStatusTypes.OK
    lastSuccessAt = new Date()
  } catch (error) {
    throw new Error(`Failed to establish integration with ${url}: ${error}`)
  }

  datasetIntegration.set({
    status,
    rawJsonData,
    estimatedResponseTimeInMs,
    estimatedSizeInBytes,
    estimatedNumberOfRecords,
    lastSuccessAt,
  })

  return allRawJsonData
}

async function fetchRawIntegrationData(
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

  const estimatedSizeInBytes = estimateSizeInBytes(data, responseHeaders["content-length"])
  const estimatedNumberOfRecords = estimateNumberOfRecords(data)

  const truncatedData = truncateDeep(data, MAX_RECORDS)

  return {
    allRawJsonData: data,
    rawJsonData: truncatedData,
    estimatedResponseTimeInMs,
    estimatedSizeInBytes,
    estimatedNumberOfRecords,
  }
}

function estimateSizeInBytes(data: object, contentLength?: string): number {
  if (contentLength) {
    return parseInt(contentLength, 10)
  }

  return new TextEncoder().encode(JSON.stringify(data)).length
}

function estimateNumberOfRecords(data: object): number {
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

export default activate
