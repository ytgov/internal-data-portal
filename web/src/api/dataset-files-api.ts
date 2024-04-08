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
  async create(
    datasetId: number,
    attributes: FormData
  ): Promise<{
    datasetFile: DatasetFile
  }> {
    const { data } = await http.post(`/api/datasets/${datasetId}/files`, attributes, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return data
  },
}

export default datasetFieldsApi
