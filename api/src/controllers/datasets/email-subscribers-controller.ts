import { isNil } from "lodash"

import { Dataset } from "@/models"
import { DatasetsPolicy } from "@/policies"

import BaseController from "@/controllers/base-controller"
import { DatasetMailer } from "@/mailers"

export class EmailSubscribersController extends BaseController {
  async create() {
    const dataset = await this.loadDataset()
    if (isNil(dataset)) {
      return this.response.status(404).json({ message: "Dataset not found." })
    }

    const policy = this.buildPolicy(dataset)
    if (!policy.update()) {
      return this.response
        .status(403)
        .json({ message: "You are not authorized to email subscribers on this dataset." })
    }

    const { to, subject, content } = this.request.body

    try {
      await DatasetMailer.deliverNow('emailSubscribers', {
        to,
        subject,
        content,
      })

      return this.response.status(200).json({ message: "Emailed subscribers." })
    } catch (error) {
      return this.response.status(422).json({ message: `Failed to email subscribers: ${error}` })
    }
  }

  private async loadDataset(): Promise<Dataset | null> {
    const { datasetIdOrSlug } = this.request.params
    return Dataset.findBySlugOrPk(datasetIdOrSlug)
  }

  private buildPolicy(dataset: Dataset) {
    return new DatasetsPolicy(this.currentUser, dataset)
  }
}

export default EmailSubscribersController
