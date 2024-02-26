import http from "@/api/http-client"

import { type Dataset } from "@/api/datasets-api"

export type VisualizationControl = {
  id: number
  datasetId: Dataset["id"]
  // TODO: add extra fields
  createdAt: string
  updatedAt: string
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
    visualizationControl: Partial<VisualizationControl>
  ): Promise<{
    visualizationControl: VisualizationControl
  }> {
    const { data } = await http.patch(`/api/visualization-controls/${id}`, visualizationControl)
    return data
  },
}

export default visualizationControlsApi
