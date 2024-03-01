import { isNil } from "lodash"

import { Dataset, DatasetIntegration } from "@/models"
import { DatasetIntegrationsPolicy } from "@/policies"
import { CreateService, UpdateService } from "@/services/dataset-integrations"

import BaseController from "@/controllers/base-controller"

export class DatasetIntegrationsController extends BaseController {
  async create() {
    const datasetIntegration = await this.buildDatasetIntegration()
    if (isNil(datasetIntegration)) {
      return this.response.status(404).json({ message: "Dataset not found." })
    }

    const policy = this.buildPolicy(datasetIntegration)
    if (!policy.create()) {
      return this.response
        .status(403)
        .json({ message: "You are not authorized to create integrations for this dataset." })
    }

    const permittedAttributes = policy.permitAttributesForCreate(this.request.body)
    try {
      const datasetIntegration = await CreateService.perform(permittedAttributes, this.currentUser)
      return this.response.status(201).json({ datasetIntegration })
    } catch (error) {
      return this.response.status(422).json({ message: `Dataset integration creation failed: ${error}` })
    }
  }

  async update() {
    const datasetIntegration = await this.loadDatasetIntegration()
    if (isNil(datasetIntegration)) {
      return this.response.status(404).json({ message: "Dataset integration not found." })
    }

    const policy = this.buildPolicy(datasetIntegration)
    if (!policy.update()) {
      return this.response
        .status(403)
        .json({ message: "You are not authorized to update integrations on this dataset." })
    }

    const permittedAttributes = policy.permitAttributesForUpdate(this.request.body)
    try {
      const updatedDatasetIntegration = await UpdateService.perform(
        datasetIntegration,
        permittedAttributes,
        this.currentUser
      )
      return this.response.status(200).json({ datasetIntegration: updatedDatasetIntegration })
    } catch (error) {
      return this.response.status(422).json({ message: `Dataset integration update failed: ${error}` })
    }
  }

  private async buildDatasetIntegration(): Promise<DatasetIntegration | null> {
    const datasetIntegration = DatasetIntegration.build(this.request.body)
    if (isNil(datasetIntegration)) return null

    const { datasetId } = this.request.body
    if (isNil(datasetId)) return null

    const dataset = await Dataset.findByPk(datasetId)
    if (isNil(dataset)) return null

    datasetIntegration.dataset = dataset

    // TODO: figure out how to make this type cast unneccessary
    return datasetIntegration as DatasetIntegration
  }

  private async loadDatasetIntegration(): Promise<DatasetIntegration | null> {
    const { datasetIntegrationId } = this.request.params
    return DatasetIntegration.findByPk(datasetIntegrationId, {
      include: ["dataset"],
    })
  }

  private buildPolicy(datasetIntegration: DatasetIntegration) {
    return new DatasetIntegrationsPolicy(this.currentUser, datasetIntegration)
  }
}

export default DatasetIntegrationsController
