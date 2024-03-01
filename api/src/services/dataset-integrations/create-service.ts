import { isNil } from "lodash"
import axios, { AxiosError } from "axios"

import { DatasetIntegration, User } from "@/models"

import BaseService from "@/services/base-service"
import { DatasetIntegrationStatusTypes } from "@/models/dataset-integration"

type Attributes = Partial<DatasetIntegration>

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
    let rawJsonData: string | null = null
    let errorCode: string | null = null
    let errorDetails: string | null = null
    let lastSuccessAt: Date | null = null
    let lastFailureAt: Date | null = null
    try {
      rawJsonData = await this.fetchRawIntegrationData(url, headers)
      status = DatasetIntegrationStatusTypes.OK
      lastSuccessAt = new Date()
    } catch (error) {
      if (error instanceof AxiosError) {
        status = DatasetIntegrationStatusTypes.ERRORED
        errorCode = error.response?.status.toString() || null
        errorDetails = error.response?.statusText || null
        lastFailureAt = new Date()
      } else {
        status = DatasetIntegrationStatusTypes.ERRORED
        errorCode = "500"
        errorDetails = `Unexpected error: ${error}`
        lastFailureAt = new Date()
      }
    }

    const datasetIntegration = await DatasetIntegration.create({
      datasetId,
      url,
      ...optionalAttributes,
      status,
      rawJsonData,
      errorCode,
      errorDetails,
      lastSuccessAt,
      lastFailureAt,
    })

    // TODO: log creating user

    return datasetIntegration
  }

  private async fetchRawIntegrationData(
    url: string,
    headers?: Record<string, string>
  ): Promise<string> {
    const { data } = await axios.get(url, {
      headers,
    })

    return JSON.stringify(data)
  }
}

export default CreateService
