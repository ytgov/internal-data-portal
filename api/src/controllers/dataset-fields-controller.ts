import { WhereOptions } from "sequelize"
import { isNil } from "lodash"

import { Dataset, DatasetField } from "@/models"
import { DatasetFieldsPolicy } from "@/policies"
import { DatasetFieldWithDataset } from "@/policies/dataset-fields-policy"
import { CreateService, DestroyService, UpdateService } from "@/services/dataset-fields"

import BaseController from "@/controllers/base-controller"

export class DatasetFieldsController extends BaseController {
  async index() {
    const where = this.query.where as WhereOptions<DatasetField>

    const scopedDatasetFields = DatasetFieldsPolicy.applyScope([], this.currentUser)

    const totalCount = await scopedDatasetFields.count({ where })
    const datasetFields = await scopedDatasetFields.findAll({
      where,
      limit: this.pagination.limit,
      offset: this.pagination.offset,
      order: [["displayName", "ASC"]],
    })

    return this.response.json({ datasetFields, totalCount })
  }

  async create() {
    const datasetField = await this.buildDatasetField()
    if (isNil(datasetField)) {
      return this.response.status(404).json({ message: "Dataset not found." })
    }

    const policy = this.buildPolicy(datasetField)
    if (!policy.create()) {
      return this.response
        .status(403)
        .json({ message: "You are not authorized to create fields for this dataset." })
    }

    const permittedAttributes = policy.permitAttributesForCreate(this.request.body)
    try {
      const datasetField = await CreateService.perform(permittedAttributes, this.currentUser)
      return this.response.status(201).json({ datasetField })
    } catch (error) {
      return this.response.status(422).json({ message: `Dataset field creation failed: ${error}` })
    }
  }

  async update() {
    const datasetField = await this.loadDatasetField()
    if (isNil(datasetField)) {
      return this.response.status(404).json({ message: "Dataset field not found." })
    }

    const policy = this.buildPolicy(datasetField)
    if (!policy.update()) {
      return this.response
        .status(403)
        .json({ message: "You are not authorized to update fields on this dataset." })
    }

    const permittedAttributes = policy.permitAttributesForUpdate(this.request.body)
    try {
      const updatedDatasetField = await UpdateService.perform(
        datasetField,
        permittedAttributes,
        this.currentUser
      )
      return this.response.status(200).json({ datasetField: updatedDatasetField })
    } catch (error) {
      return this.response.status(422).json({ message: `Dataset field update failed: ${error}` })
    }
  }

  async destroy() {
    const datasetField = await this.loadDatasetField()
    if (isNil(datasetField)) {
      return this.response.status(404).json({ message: "Dataset field not found." })
    }

    const policy = this.buildPolicy(datasetField)
    if (!policy.update()) {
      return this.response
        .status(403)
        .json({ message: "You are not authorized to destroy fields on this dataset." })
    }

    try {
      await DestroyService.perform(datasetField, this.currentUser)
      return this.response.status(204).end()
    } catch (error) {
      return this.response
        .status(422)
        .json({ message: `Dataset field destruction failed: ${error}` })
    }
  }

  private async buildDatasetField(): Promise<DatasetFieldWithDataset | null> {
    const datasetField = DatasetField.build(this.request.body)
    if (isNil(datasetField)) return null

    const { datasetId } = this.request.body
    if (isNil(datasetId)) return null

    const dataset = await Dataset.findByPk(datasetId)
    if (isNil(dataset)) return null

    datasetField.dataset = dataset

    // TODO: figure out how to make this type cast unneccessary
    return datasetField as DatasetFieldWithDataset
  }

  private async loadDatasetField(): Promise<DatasetFieldWithDataset | null> {
    const { datasetFieldId } = this.request.params
    const datasetField = await DatasetField.findByPk(datasetFieldId, { include: ["dataset"] })
    if (isNil(datasetField?.dataset)) return null

    // TODO: figure out how to make this type cast unneccessary
    return datasetField as DatasetFieldWithDataset
  }

  private buildPolicy(datasetField: DatasetFieldWithDataset) {
    return new DatasetFieldsPolicy(this.currentUser, datasetField)
  }
}

export default DatasetFieldsController
