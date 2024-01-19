import { Dataset } from "@/models"
import { DatasetsPolicy } from "@/policies"
import { assertDatasetPolicyRecord, type DatasetPolicyRecord } from "@/policies/datasets-policy"
import { CreateService } from "@/services/datasets"

import BaseController from "@/controllers/base-controller"

export class DatasetsController extends BaseController {
  async create() {
    const dataset = await this.buildDataset()
    const policy = this.buildPolicy(dataset)
    if (!policy.create()) {
      return this.response
        .status(403)
        .json({ message: "You are not authorized to create this dataset." })
    }

    const permittedAttributes = policy.permitAttributesForCreate(this.request.body)
    try {
      const dataset = await CreateService.perform(permittedAttributes, this.currentUser)
      return this.response.status(201).json({ dataset })
    } catch (error) {
      return this.response.status(422).json({ message: `Dataset creation failed: ${error}` })
    }
  }

  private async buildDataset(): Promise<DatasetPolicyRecord> {
    const attributes = this.request.body

    // Sadly "include" does not work in "build".
    // And also the "getOwner" function does not inject the owner into the dataset.
    const dataset = Dataset.build(attributes)
    dataset.owner = await dataset.getOwner({ include: ["roles"] })

    // TypeScript garbage because inline check doesn't change type
    assertDatasetPolicyRecord(dataset)

    return dataset
  }

  private buildPolicy(record: DatasetPolicyRecord): DatasetsPolicy {
    return new DatasetsPolicy(this.currentUser, record)
  }
}

export default DatasetsController
