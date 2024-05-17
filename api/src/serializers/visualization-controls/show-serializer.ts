import { isUndefined, pick } from "lodash"

import { DatasetField, User, VisualizationControl } from "@/models"
import BaseSerializer from "@/serializers/base-serializer"

export type VisualizationControlShowView = Partial<VisualizationControl> & {
  searchExcludedDatasetFields: DatasetField[]
}

export class ShowSerializer extends BaseSerializer<VisualizationControl> {
  constructor(
    protected record: VisualizationControl,
    protected currentUser: User
  ) {
    super(record)
  }

  perform(): VisualizationControlShowView {
    if (isUndefined(this.record.searchExcludedDatasetFields)) {
      throw new Error("Expected record to have a searchExcludedDatasetFields association")
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
      searchExcludedDatasetFields: this.record.searchExcludedDatasetFields,
    }
  }
}

export default ShowSerializer
