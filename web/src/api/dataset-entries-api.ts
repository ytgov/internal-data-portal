import http from "@/api/http-client"

import { Dataset } from "@/api/datasets-api"
import { DatasetFieldDataTypes } from "@/api/dataset-fields-api"

export type DatasetEntry = {
  id: number
  datasetId: Dataset["id"]
  // datasetSchemaId: ???
  data: Record<string, DatasetFieldDataTypes>
  createdAt: string
  updatedAt: string
}

export const datasetEntriesApi = {
  async list({
    where,
    page,
    perPage,
  }: {
    where?: Record<string, unknown> // TODO: consider adding Sequelize types to front-end?
    page?: number
    perPage?: number
  } = {}): Promise<{
    datasetEntries: DatasetEntry[]
    totalCount: number
  }> {
    const { data } = await http.get("/api/dataset-entries", {
      params: { where, page, perPage },
    })
    return data
  },
}

export default datasetEntriesApi
