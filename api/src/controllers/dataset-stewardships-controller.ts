import { isNil } from "lodash"

import { DatasetStewardship } from "@/models"
import { DatasetStewardshipsPolicy } from "@/policies"
import { UpdateService } from "@/services/dataset-stewardships"

import BaseController from "@/controllers/base-controller"

export class DatasetStewardshipsController extends BaseController {
  async update() {
    const datasetStewardship = await this.loadDatasetStewardship()
    if (isNil(datasetStewardship)) {
      return this.response.status(404).json({ message: "Dataset stewardship not found." })
    }

    const policy = this.buildPolicy(datasetStewardship)
    if (!policy.update()) {
      return this.response
        .status(403)
        .json({ message: "You are not authorized to update this dataset stewardship." })
    }

    const permittedAttributes = policy.permitAttributesForUpdate(this.request.body)
    try {
      const updatedDatasetStewardship = await UpdateService.perform(
        datasetStewardship,
        permittedAttributes,
        this.currentUser
      )
      return this.response.status(200).json({ datasetStewardship: updatedDatasetStewardship })
    } catch (error) {
      return this.response
        .status(422)
        .json({ message: `Dataset stewardship update failed: ${error}` })
    }
  }

  private async loadDatasetStewardship(): Promise<DatasetStewardship | null> {
    return DatasetStewardship.findByPk(this.params.datasetStewardshipId)
  }

  private buildPolicy(record: DatasetStewardship): DatasetStewardshipsPolicy {
    return new DatasetStewardshipsPolicy(this.currentUser, record)
  }
}

export default DatasetStewardshipsController
