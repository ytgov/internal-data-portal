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

export const datasetEntriesApi = {
  async list({
    where,
    searchToken,
    page,
    perPage,
  }: {
    where?: Record<string, unknown> // TODO: consider adding Sequelize types to front-end?
    searchToken?: string
    page?: number
    perPage?: number
  } = {}): Promise<{
    datasetEntries: DatasetEntry[]
    totalCount: number
  }> {
    const { data } = await http.get("/api/dataset-entries", {
      params: { where, searchToken, page, perPage },
    })
    return data
  },
}

export default datasetEntriesApi
