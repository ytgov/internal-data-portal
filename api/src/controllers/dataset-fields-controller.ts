import { WhereOptions } from "sequelize"
import { isNil } from "lodash"

import { Dataset, DatasetField } from "@/models"
import { DatasetsPolicy } from "@/policies"

import BaseController from "@/controllers/base-controller"
import { CreateService } from "@/services/dataset-fields"

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

  async create() {
    const dataset = await this.loadDataset()
    if (isNil(dataset)) {
      return this.response.status(404).json({ message: "Dataset not found." })
    }

    const policy = this.buildDatasetPolicy(dataset)
    if (!policy.update()) {
      return this.response
        .status(403)
        .json({ message: "You are not authorized to create fields against this dataset." })
    }

    try {
      const datasetField = await CreateService.perform(this.request.body, this.currentUser)
      return this.response.status(201).json({ datasetField })
    } catch (error) {
      return this.response.status(422).json({ message: `Dataset field creation failed: ${error}` })
    }
  }

  private async loadDataset(): Promise<Dataset | null> {
    const { datasetId } = this.request.body
    return Dataset.findByPk(datasetId)
  }

  private buildDatasetPolicy(taggable: Dataset) {
    return new DatasetsPolicy(this.currentUser, taggable)
  }
}

export default DatasetFieldsController
