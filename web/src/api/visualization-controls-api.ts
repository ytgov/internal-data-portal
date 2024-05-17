import http from "@/api/http-client"

import { type Dataset } from "@/api/datasets-api"
import { type DatasetField } from "@/api/dataset-fields-api"

export type VisualizationControl = {
  id: number
  datasetId: Dataset["id"]
  isDownloadableAsCsv: boolean
  hasPreview: boolean
  hasFieldsExcludedFromPreview: boolean
  hasPreviewRowLimit: boolean
  previewRowLimit: number | null
  createdAt: string
  updatedAt: string

  // Associations
  searchExcludedDatasetFields: DatasetField[]
}

export type searchExcludedDatasetFieldsAttributes = Pick<DatasetField, "id" | "isExcludedFromPreview">

export type VisualizationControlUpdate = Partial<VisualizationControl> & {
  searchExcludedDatasetFieldsAttributes?: searchExcludedDatasetFieldsAttributes[]
}

export const visualizationControlsApi = {
  async get(id: number): Promise<{
    visualizationControl: VisualizationControl
  }> {
    const { data } = await http.get(`/api/visualization-controls/${id}`)
    return data
  },
  async update(
    id: number,
    visualizationControl: VisualizationControlUpdate
  ): Promise<{
    visualizationControl: VisualizationControl
  }> {
    const { data } = await http.patch(`/api/visualization-controls/${id}`, visualizationControl)
    return data
  },
}

export default visualizationControlsApi
