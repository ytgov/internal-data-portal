import { WhereOptions } from "sequelize"
import { isEmpty } from "lodash"

import { DatasetEntryPreview } from "@/models"
import { BaseScopeOptions } from "@/policies/base-policy"
import { DatasetEntryPreviewsPolicy } from "@/policies"
import BaseController from "@/controllers/base-controller"

export class DatasetEntryPreviewsController extends BaseController {
  async index() {
    const where = this.query.where as WhereOptions<DatasetEntryPreview>
    const filters = this.query.filters as Record<string, unknown>

    const scopes: BaseScopeOptions[] = []
    if (!isEmpty(filters)) {
      Object.entries(filters).forEach(([key, value]) => {
        scopes.push({ method: [key, value] })
      })
    }
    const scopedDatasetEntryPreview = DatasetEntryPreviewsPolicy.applyScope(
      scopes,
      this.currentUser
    )

    const totalCount = await scopedDatasetEntryPreview.count({ where })
    const datasetEntryPreviews = await scopedDatasetEntryPreview.findAll({
      where,
      limit: this.pagination.limit,
      offset: this.pagination.offset,
    })

    return this.response.json({ datasetEntryPreviews, totalCount })
  }
}

export default DatasetEntryPreviewsController
