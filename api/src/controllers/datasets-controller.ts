import { WhereOptions } from "sequelize"
import { isNil } from "lodash"

import { Dataset } from "@/models"
import { DatasetsPolicy } from "@/policies"
import { CreateService, UpdateService } from "@/services/datasets"
import { TableSerializer } from "@/serializers/datasets"

import BaseController from "@/controllers/base-controller"

export class DatasetsController extends BaseController {
  async index() {
    const where = this.query.where as WhereOptions<Dataset>

    // TODO: add query scoping, filter out datasets where the user does not have any access

    const totalCount = await Dataset.count({ where })
    const datasets = await Dataset.findAll({
      where,
      limit: this.pagination.limit,
      offset: this.pagination.offset,
      include: [
        {
          association: "owner",
          include: [
            {
              association: "groupMembership",
              include: ["department", "division", "branch", "unit"],
            },
          ],
        },
        {
          association: "stewardship",
          include: ["department", "division", "branch", "unit"],
        },
        "creator",
        "tags",
        "accessGrants",
        "accessRequests",
      ],
    })

    const serializedDatasets = TableSerializer.perform(datasets, this.currentUser)
    return this.response.json({ datasets: serializedDatasets, totalCount })
  }

  async show() {
    const dataset = await this.loadDataset()
    if (isNil(dataset)) {
      return this.response.status(404).json({ message: "Dataset not found." })
    }

    const policy = this.buildPolicy(dataset)
    if (!policy.show()) {
      return this.response
        .status(403)
        .json({ message: "You are not authorized to view this dataset." })
    }

    return this.response.status(200).json({ dataset })
  }

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

  async update() {
    const dataset = await this.loadDataset()
    if (isNil(dataset)) {
      return this.response.status(404).json({ message: "Dataset not found." })
    }

    const policy = this.buildPolicy(dataset)
    if (!policy.update()) {
      return this.response
        .status(403)
        .json({ message: "You are not authorized to update this dataset." })
    }

    const permittedAttributes = policy.permitAttributesForUpdate(this.request.body)
    try {
      const updatedDataset = await UpdateService.perform(
        dataset,
        permittedAttributes,
        this.currentUser
      )
      return this.response.status(200).json({ dataset: updatedDataset })
    } catch (error) {
      return this.response.status(422).json({ message: `Dataset update failed: ${error}` })
    }
  }

  private async loadDataset(): Promise<Dataset | null> {
    const dataset = await Dataset.findBySlugOrPk(this.params.datasetIdOrSlug, {
      include: ["owner", "creator", "stewardship"],
    })

    return dataset
  }

  private async buildDataset(): Promise<Dataset> {
    const attributes = this.request.body
    const dataset = Dataset.build(attributes)
    return dataset
  }

  private buildPolicy(record: Dataset): DatasetsPolicy {
    return new DatasetsPolicy(this.currentUser, record)
  }
}

export default DatasetsController
