import db, { DatasetField, User, VisualizationControl } from "@/models"

import BaseService from "@/services/base-service"
import RefreshDatasetEntryPreviewService from "@/services/visualization-controls/refresh-dataset-entry-preview-service"

type DatasetFieldsAttributes = Pick<DatasetField, "id" | "isExcludedFromPreview">[]
type Attributes = Partial<VisualizationControl> & {
  previewExcludedDatasetFieldsAttributes?: DatasetFieldsAttributes
}

export class UpdateService extends BaseService {
  constructor(
    protected visualizationControl: VisualizationControl,
    protected attributes: Attributes,
    protected currentUser: User
  ) {
    super()
  }

  async perform(): Promise<VisualizationControl> {
    return db.transaction(async () => {
      await this.visualizationControl.update(this.attributes)

      const { previewExcludedDatasetFieldsAttributes } = this.attributes
      if (previewExcludedDatasetFieldsAttributes) {
        await this.bulkReplaceSearchExcludeOnDatasetFields(previewExcludedDatasetFieldsAttributes)
      }

      if (this.visualizationControl.hasPreview) {
        await RefreshDatasetEntryPreviewService.perform(this.visualizationControl, this.currentUser)
      }

      // TODO: log user action

      return this.visualizationControl.reload({
        include: ["previewExcludedDatasetFields"],
      })
    })
  }

  private async bulkReplaceSearchExcludeOnDatasetFields(attributes: DatasetFieldsAttributes) {
    await DatasetField.update(
      {
        isExcludedFromPreview: false,
      },
      {
        where: {
          datasetId: this.visualizationControl.datasetId,
          isExcludedFromPreview: true,
        },
      }
    )
    const datasetFieldIds = attributes
      .filter((attributes) => attributes.isExcludedFromPreview)
      .map((attributes) => attributes.id)
    await DatasetField.update(
      {
        isExcludedFromPreview: true,
      },
      {
        where: {
          id: datasetFieldIds,
        },
      }
    )
  }
}

export default UpdateService
