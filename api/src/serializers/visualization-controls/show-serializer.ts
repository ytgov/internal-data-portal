import { isUndefined, pick } from "lodash"

import { DatasetField, User, VisualizationControl } from "@/models"
import BaseSerializer from "@/serializers/base-serializer"

export type VisualizationControlShowView = Partial<VisualizationControl> & {
  previewExcludedDatasetFields: DatasetField[]
}

export class ShowSerializer extends BaseSerializer<VisualizationControl> {
  constructor(
    protected record: VisualizationControl,
    protected currentUser: User
  ) {
    super(record)
  }

  perform(): VisualizationControlShowView {
    if (isUndefined(this.record.previewExcludedDatasetFields)) {
      throw new Error("Expected record to have a previewExcludedDatasetFields association")
    }

    return {
      ...pick(this.record.dataValues, [
        "id",
        "datasetId",
        "isDownloadableAsCsv",
        "hasPreview",
        "hasFieldsExcludedFromPreview",
        "hasPreviewRowLimit",
        "previewRowLimit",
        "createdAt",
        "updatedAt",
      ]),
      previewExcludedDatasetFields: this.record.previewExcludedDatasetFields,
    }
  }
}

export default ShowSerializer
