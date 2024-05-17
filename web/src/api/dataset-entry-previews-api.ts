import http from "@/api/http-client"

import { Dataset } from "@/api/datasets-api"
import { DatasetEntry, DatasetEntryJsonDataType } from "@/api/dataset-entries-api"

export type DatasetEntryPreview = {
  id: number
  datasetId: Dataset["id"]
  datasetEntryId: DatasetEntry["id"]
  jsonData: DatasetEntryJsonDataType
  createdAt: string
  updatedAt: string
}

export type DatasetEntryPreviewFilters = {
  search?: string
}

export const datasetEntryPreviewsApi = {
  async list(
    params: {
      where?: Record<string, unknown> // TODO: consider adding Sequelize types to front-end?
      filters?: DatasetEntryPreviewFilters
      page?: number
      perPage?: number
    } = {}
  ): Promise<{
    datasetEntryPreviews: DatasetEntryPreview[]
    totalCount: number
  }> {
    const { data } = await http.get("/api/dataset-entry-previews", {
      params,
    })
    return data
  },
}

export default datasetEntryPreviewsApi
