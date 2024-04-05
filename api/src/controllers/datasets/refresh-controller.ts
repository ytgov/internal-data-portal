import { isNil } from "lodash"

import { Dataset } from "@/models"
import { DatasetsPolicy } from "@/policies"
import { CreateService } from "@/services/datasets/refresh"

import { BaseController } from "@/controllers/base-controller"

export class RefreshController extends BaseController {
  async create() {
    const dataset = await this.loadDataset()
    if (isNil(dataset)) {
      return this.response.status(404).json({ message: "Dataset not found." })
    }

    const policy = this.buildPolicy(dataset)
    if (!policy.refresh()) {
      return this.response
        .status(403)
        .json({ message: "You are not allowed to refresh this dataset." })
    }

    const { integration } = dataset
    if (isNil(integration)) {
      return this.response.status(422).json({ message: "Dataset has no integration to refresh." })
    }

    try {
      await CreateService.perform(integration, this.currentUser)
      return this.response.status(201).json({ message: "Dataset integration refreshed." })
    } catch (error) {
      console.error(`Failed to refresh dataset: ${error}`)
      return this.response
        .status(500)
        .json({ message: `Failed to refresh dataset due to server error: ${error}` })
    }
  }

  private buildPolicy(dataset: Dataset) {
    return new DatasetsPolicy(this.currentUser, dataset)
  }

  private async loadDataset(): Promise<Dataset | null> {
    const { datasetIdOrSlug } = this.request.params
    return Dataset.findBySlugOrPk(datasetIdOrSlug, {
      include: [
        "integration",
        // for policy logic
        {
          association: "owner",
          include: ["groupMembership"],
        },
        "accessGrants",
        "accessRequests",
      ],
    })
  }
}
