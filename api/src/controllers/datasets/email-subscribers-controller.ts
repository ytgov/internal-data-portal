import { isNil } from "lodash"
import { Op, WhereOptions } from "sequelize"

import { AccessRequest, Dataset, User } from "@/models"
import { DatasetsPolicy } from "@/policies"
import { DatasetMailer } from "@/mailers"

import BaseController from "@/controllers/base-controller"

export class EmailSubscribersController extends BaseController {
  async index() {
    const dataset = await this.loadDataset()
    if (isNil(dataset)) {
      return this.response.status(404).json({ message: "Dataset not found." })
    }

    const policy = this.buildPolicy(dataset)
    if (!policy.update()) {
      return this.response
        .status(403)
        .json({ message: "You are not authorized to view subscribers of this dataset." })
    }

    const where = this.query.where as WhereOptions<AccessRequest>
    const include = [
      {
        association: "accessRequestsAsRequestor",
        where: {
          ...where,
          datasetId: dataset.id,
          deniedAt: { [Op.is]: null },
          revokedAt: { [Op.is]: null },
        },
        required: true,
      },
    ]
    const totalCount = await User.count({
      include,
    })
    const users = await User.findAll({
      include,
      limit: this.pagination.limit,
      offset: this.pagination.offset,
    })

    return this.response.json({ users, totalCount })
  }

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

    const { to, subject, body } = this.request.body

    try {
      // TODO: push this into a service
      await DatasetMailer.deliverNow("emailSubscribers", {
        to,
        subject,
        body,
      })

      return this.response.status(201).json({ message: "Emailed subscribers." })
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
