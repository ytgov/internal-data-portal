import http from "@/api/http-client"

import { Dataset } from "@/api/datasets-api"
import { DatasetFieldDataTypes } from "@/api/dataset-fields-api"

export type DatasetEntryRawJsonDataType = Record<string, unknown>
export type DatasetEntryJsonDataType = Record<string, DatasetFieldDataTypes>

export type DatasetEntry = {
  id: number
  datasetId: Dataset["id"]
  rawJsonData: DatasetEntryRawJsonDataType
  jsonData: DatasetEntryJsonDataType
  createdAt: string
  updatedAt: string
}

export type DatasetEntriesFilters = {
  search?: string
}

export const datasetEntriesApi = {
  async list(
    params: {
      where?: Record<string, unknown> // TODO: consider adding Sequelize types to front-end?
      filters?: DatasetEntriesFilters
      page?: number
      perPage?: number
    } = {}
  ): Promise<{
    datasetEntries: DatasetEntry[]
    totalCount: number
  }> {
    const { data } = await http.get("/api/dataset-entries", {
      params,
    })
    return data
  },
}

export default datasetEntriesApi
