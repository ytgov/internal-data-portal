import http from "@/api/http-client"

import { type Dataset } from "@/api/datasets-api"

export type DatasetFile = {
  id: number
  datasetId: Dataset["id"]
  name: string
  data: Blob
  sizeInBytes: number
  mimeType: string
  md5Hash: string
  createdAt: string
  updatedAt: string
}

export const datasetFieldsApi = {
  async create(attributes: Partial<DatasetFile>): Promise<{
    datasetFile: DatasetFile
  }> {
    const { data } = await http.post("/api/dataset-files", attributes)
    return data
  },
}

export default datasetFieldsApi
