import { WhereOptions } from "sequelize"

import { DatasetEntry } from "@/models"
import { DatasetEntriesPolicy } from "@/policies"

import BaseController from "@/controllers/base-controller"

export class DatasetEntriesController extends BaseController {
  async index() {
    const where = this.query.where as WhereOptions<DatasetEntry>

    const scopedDatasetEntries = DatasetEntriesPolicy.applyScope(DatasetEntry, this.currentUser)

    const totalCount = await scopedDatasetEntries.count({ where })
    const datasetEntries = await scopedDatasetEntries.findAll({
      where,
      limit: this.pagination.limit,
      offset: this.pagination.offset,
    })

    return this.response.json({ datasetEntries, totalCount })
  }
}

export default DatasetEntriesController
