import { isEmpty, pick } from "lodash"

import nestableTransaction from "@/db/utils/nestable-transaction"
import {
  DatasetEntry,
  DatasetEntryPreview,
  DatasetField,
  User,
  VisualizationControl,
} from "@/models"
import BaseService from "@/services/base-service"

export class RefreshDatasetEntryPreviewService extends BaseService {
  constructor(
    protected visualizationControl: VisualizationControl,
    protected currentUser: User
  ) {
    super()
  }

  async perform(): Promise<DatasetEntryPreview[]> {
    return nestableTransaction(async () => {
      await DatasetEntryPreview.destroy({
        where: {
          datasetId: this.visualizationControl.datasetId,
        },
      })

      const fieldExclusionCondition =
        this.visualizationControl.hasFieldsExcludedFromPreview == true
          ? { isExcludedFromPreview: false }
          : {}
      const previewableDatasetFields = await DatasetField.findAll({
        where: {
          datasetId: this.visualizationControl.datasetId,
          ...fieldExclusionCondition,
        },
      })
      const previewableDatasetFieldNames = previewableDatasetFields.map((field) => field.name)
      if (isEmpty(previewableDatasetFieldNames)) {
        return []
      }

      const datasetEntriesForPreview = await DatasetEntry.findAll({
        where: {
          datasetId: this.visualizationControl.datasetId,
        },
        offset: 0,
        limit: this.visualizationControl.previewRowLimit,
      })
      const datasetEntryPreviewsAttributes = datasetEntriesForPreview.map((datasetEntry) => {
        const jsonData = pick(datasetEntry.jsonData, previewableDatasetFieldNames)
        return {
          datasetId: this.visualizationControl.datasetId,
          datasetEntryId: datasetEntry.id,
          jsonData,
        }
      })
      return DatasetEntryPreview.bulkCreate(datasetEntryPreviewsAttributes)
    })
  }
}

export default RefreshDatasetEntryPreviewService
