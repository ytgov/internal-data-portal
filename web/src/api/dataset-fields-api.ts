import http from "@/api/http-client"

import { Dataset } from "@/api/datasets-api"

// Keep in sync with api/src/models/dataset-field.ts
export enum DatasetFieldDataTypes {
  INTEGER = "integer",
  TEXT = "text",
}

export type DatasetField = {
  id: number
  datasetId: Dataset["id"]
  name: string
  displayName: string
  dataType: DatasetFieldDataTypes
  description: string
  note: string
  isExcludedFromPreview: boolean
  createdAt: string
  updatedAt: string
}

export const datasetFieldsApi = {
  async list({
    where,
    page,
    perPage,
  }: {
    where?: Record<string, unknown> // TODO: consider adding Sequelize types to front-end?
    page?: number
    perPage?: number
  } = {}): Promise<{
    datasetFields: DatasetField[]
    totalCount: number
  }> {
    const { data } = await http.get("/api/dataset-fields", {
      params: { where, page, perPage },
    })
    return data
  },
  async create(attributes: Partial<DatasetField>): Promise<{
    datasetField: DatasetField
  }> {
    const { data } = await http.post("/api/dataset-fields", attributes)
    return data
  },
  async update(
    datasetFieldId: number,
    attributes: Partial<DatasetField>
  ): Promise<{
    datasetField: DatasetField
  }> {
    const { data } = await http.patch(`/api/dataset-fields/${datasetFieldId}`, attributes)
    return data
  },
  async delete(datasetFieldId: number): Promise<void> {
    const { data } = await http.delete(`/api/dataset-fields/${datasetFieldId}`)
    return data
  },
}

export default datasetFieldsApi
