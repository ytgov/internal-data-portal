import { WhereOptions } from "sequelize"
import { isEmpty } from "lodash"

import { DatasetEntry } from "@/models"
import { DatasetEntriesPolicy } from "@/policies"

import BaseController from "@/controllers/base-controller"

export class DatasetEntriesController extends BaseController {
  async index() {
    const where = this.query.where as WhereOptions<DatasetEntry>
    const searchToken = this.query.searchToken as string

    const scopedDatasetEntries = DatasetEntriesPolicy.applyScope(DatasetEntry, this.currentUser)

    let filteredDatasetEntries = scopedDatasetEntries
    if (!isEmpty(searchToken)) {
      filteredDatasetEntries = scopedDatasetEntries.scope({ method: ["search", searchToken] })
    }

    const totalCount = await filteredDatasetEntries.count({ where })
    const datasetEntries = await filteredDatasetEntries.findAll({
      where,
      limit: this.pagination.limit,
      offset: this.pagination.offset,
    })

    return this.response.json({ datasetEntries, totalCount })
  }
}

export default DatasetEntriesController
