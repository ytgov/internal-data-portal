import { WhereOptions } from "sequelize"

import { DatasetField } from "@/models"

import BaseController from "@/controllers/base-controller"

export class DatasetFieldsController extends BaseController {
  async index() {
    const where = this.query.where as WhereOptions<DatasetField>

    const totalCount = await DatasetField.count({ where })
    const datasetFields = await DatasetField.findAll({
      where,
      limit: this.pagination.limit,
      offset: this.pagination.offset,
      order: [["displayName", "ASC"]],
    })

    return this.response.json({ datasetFields, totalCount })
  }
}

export default DatasetFieldsController
