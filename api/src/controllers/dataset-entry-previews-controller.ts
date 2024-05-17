import { WhereOptions } from "sequelize"
import { isEmpty } from "lodash"

import { DatasetEntryPreview } from "@/models"
import { DatasetEntryPreviewsPolicy } from "@/policies"

import BaseController from "@/controllers/base-controller"

export class DatasetEntryPreviewsController extends BaseController {
  async index() {
    const where = this.query.where as WhereOptions<DatasetEntryPreview>
    const filters = this.query.filters as Record<string, unknown>

    const scopedDatasetEntryPreview = DatasetEntryPreviewsPolicy.applyScope(
      DatasetEntryPreview,
      this.currentUser
    )

    let filteredDatasetEntryPreview = scopedDatasetEntryPreview
    if (!isEmpty(filters)) {
      Object.entries(filters).forEach(([key, value]) => {
        filteredDatasetEntryPreview = filteredDatasetEntryPreview.scope({ method: [key, value] })
      })
    }


    const totalCount = await filteredDatasetEntryPreview.count({ where })
    const datasetEntryPreviews = await filteredDatasetEntryPreview.findAll({
      where,
      limit: this.pagination.limit,
      offset: this.pagination.offset,
    })

    return this.response.json({ datasetEntryPreviews, totalCount })
  }
}

export default DatasetEntryPreviewsController
