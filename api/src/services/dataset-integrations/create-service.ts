import { isNil } from "lodash"
import axios from "axios"

import { DatasetIntegration, User } from "@/models"
import {
  DatasetIntegrationRawJsonDataType,
  DatasetIntegrationStatusTypes,
} from "@/models/dataset-integration"

import BaseService from "@/services/base-service"

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
    let rawJsonData: DatasetIntegrationRawJsonDataType | null = null
    let lastSuccessAt: Date | null = null
    try {
      rawJsonData = await this.fetchRawIntegrationData(url, headers)
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
      lastSuccessAt,
    })

    // TODO: log creating user

    return datasetIntegration
  }

  private async fetchRawIntegrationData(
    url: string,
    headers?: Record<string, string>
  ): Promise<DatasetIntegrationRawJsonDataType> {
    const { data } = await axios.get(url, {
      headers,
    })

    return data
  }
}

export default CreateService
