import http from "@/api/http-client"

import { Dataset } from "@/api/datasets-api"

// Keep in sync with api/src/models/dataset-field.ts
export enum DatasetIntegrationStatusTypes {
  OK = "ok",
  ERRORED = "errored",
}

export type DatasetIntegration = {
  id: number
  datasetId: Dataset["id"]
  url: string
  headerKey: string | null
  headerValue: string | null
  jmesPathTransform: string | null
  rawJsonData: string | null
  parsedJsonData: string | null
  status: string
  errorCode: string | null
  errorDetails: string | null
  lastSuccessAt: string | null
  lastFailureAt: string | null
  createdAt: string
  updatedAt: string
}

export const datasetIntegrationsApi = {
  // TODO: remove this method and use create/update instead?
  async preview(
    externalApiUrl: string,
    externalApiHeaderKey: string,
    externalApiHeaderValue: string
  ): Promise<unknown> {
    const { data } = await http.post("/api/preview", {
      externalApiUrl,
      externalApiHeaderKey,
      externalApiHeaderValue,
    })
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
    attributes: Partial<DatasetIntegration>
  ): Promise<{
    datasetIntegration: DatasetIntegration
  }> {
    const { data } = await http.patch(
      `/api/dataset-integrations/${datasetIntegrationId}`,
      attributes
    )
    return data
  },
  async delete(datasetIntegrationId: number): Promise<void> {
    const { data } = await http.delete(`/api/dataset-integrations/${datasetIntegrationId}`)
    return data
  },
}

export default datasetIntegrationsApi
