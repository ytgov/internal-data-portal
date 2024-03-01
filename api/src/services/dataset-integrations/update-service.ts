import axios from "axios"
import { isNil } from "lodash"

import { DatasetIntegration, User } from "@/models"

import BaseService from "@/services/base-service"
import { DatasetIntegrationStatusTypes } from "@/models/dataset-integration"

type Attributes = Partial<DatasetIntegration>

export class UpdateService extends BaseService {
  constructor(
    private datasetIntegration: DatasetIntegration,
    private attributes: Attributes,
    private currentUser: User
  ) {
    super()
  }

  async perform(): Promise<DatasetIntegration> {
    const { url, headerKey, headerValue } = this.attributes

    let status: DatasetIntegrationStatusTypes = this.datasetIntegration.status
    let rawJsonData: string | null = this.datasetIntegration.rawJsonData
    let lastSuccessAt: Date | null = this.datasetIntegration.lastSuccessAt
    if (
      (!isNil(url) && url !== this.datasetIntegration.url) ||
      (!isNil(headerKey) && headerKey !== this.datasetIntegration.headerKey) ||
      (!isNil(headerValue) && headerValue !== this.datasetIntegration.headerValue)
    ) {
      let headers = {}
      if (!isNil(headerKey)) {
        headers = { [headerKey]: headerValue }
      }

      // This should not be required, but TypeScript is flaking.
      if (isNil(url)) {
        throw new Error("URL is required")
      }

      try {
        rawJsonData = await this.fetchRawIntegrationData(url, headers)
        status = DatasetIntegrationStatusTypes.OK
        lastSuccessAt = new Date()
      } catch (error) {
        throw new Error(`Failed to establish integration with ${url}: ${error}`)
      }
    }

    await this.datasetIntegration.update({
      ...this.attributes,
      status,
      rawJsonData,
      lastSuccessAt,
    })

    // TODO: log user action

    return this.datasetIntegration
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

export default UpdateService
