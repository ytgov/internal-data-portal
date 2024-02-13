import http from "@/api/http-client"

import { Dataset } from "@/api/datasets-api"

export enum DataTypes {
  INTEGER = "integer",
  TEXT = "text",
}

export type DatasetField = {
  id: number
  datasetId: Dataset["id"]
  name: string
  displayName: string
  dataType: DataTypes
  description: string
  note: string
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
}

export default datasetFieldsApi
