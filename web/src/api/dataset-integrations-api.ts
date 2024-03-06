import http from "@/api/http-client"

import { Dataset } from "@/api/datasets-api"

// Keep in sync with api/src/models/dataset-field.ts
export enum DatasetIntegrationStatusTypes {
  OK = "ok",
  ERRORED = "errored",
}

export type DatasetIntegrationRawJsonDataType = Record<string, unknown>
export type DatasetIntegrationParsedJsonDataType = Record<string, unknown>[]

export type DatasetIntegration = {
  id: number
  datasetId: Dataset["id"]
  url: string
  headerKey: string | null
  headerValue: string | null
  jmesPathTransform: string | null
  rawJsonData: DatasetIntegrationRawJsonDataType | null
  parsedJsonData: DatasetIntegrationParsedJsonDataType | null
  status: string
  errorCode: string | null
  errorDetails: string | null
  lastSuccessAt: string | null
  lastFailureAt: string | null
  createdAt: string
  updatedAt: string
}

export const datasetIntegrationsApi = {
  async get(datasetIntegrationId: number): Promise<{
    datasetIntegration: DatasetIntegration
  }> {
    const { data } = await http.get(`/api/dataset-integrations/${datasetIntegrationId}`)
    return data
  },
  async create(attributes: Partial<DatasetIntegration>): Promise<{
    datasetIntegration: DatasetIntegration
  }> {
    const { data } = await http.post("/api/dataset-integrations", attributes)
    return data
  },
  async update(
    datasetIntegrationId: number,
    attributes: Partial<DatasetIntegration>,
    controlFlags: { isPreview?: boolean } = {}
  ): Promise<{
    datasetIntegration: DatasetIntegration
  }> {
    const { data } = await http.patch(
      `/api/dataset-integrations/${datasetIntegrationId}`,
      attributes,
      {
        params: controlFlags,
      }
    )
    return data
  },
  async delete(datasetIntegrationId: number): Promise<void> {
    const { data } = await http.delete(`/api/dataset-integrations/${datasetIntegrationId}`)
    return data
  },
}

export default datasetIntegrationsApi
