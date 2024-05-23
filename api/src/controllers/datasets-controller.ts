import { WhereOptions } from "sequelize"
import { isEmpty, isNil } from "lodash"

import { Dataset } from "@/models"
import { BaseScopeOptions } from "@/policies/base-policy"
import { DatasetsPolicy } from "@/policies"
import { CreateService, UpdateService } from "@/services/datasets"
import { ShowSerializer, TableSerializer } from "@/serializers/datasets"

import BaseController from "@/controllers/base-controller"

export class DatasetsController extends BaseController {
  async index() {
    const where = this.query.where as WhereOptions<Dataset>
    const filters = this.query.filters as Record<string, unknown>

    const scopes: BaseScopeOptions[] = []
    if (!isEmpty(filters)) {
      Object.entries(filters).forEach(([key, value]) => {
        scopes.push({ method: [key, value] })
      })
    }
    const scopedDatasets = DatasetsPolicy.applyScope(scopes, this.currentUser)

    const totalCount = await scopedDatasets.count({ where })
    const datasets = await scopedDatasets.findAll({
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

    try {
      const serializedDatasets = TableSerializer.perform(datasets, this.currentUser)
      return this.response.json({ datasets: serializedDatasets, totalCount })
    } catch (error) {
      return this.response.status(500).json({ message: `Dataset serialization failed: ${error}` })
    }
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

    try {
      const serializedDataset = ShowSerializer.perform(dataset, this.currentUser)
      return this.response.status(200).json({
        dataset: serializedDataset,
        policy,
      })
    } catch (error) {
      return this.response.status(500).json({ message: `Dataset serialization failed: ${error}` })
    }
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
      const serializedDataset = ShowSerializer.perform(updatedDataset, this.currentUser)
      return this.response.status(200).json({ dataset: serializedDataset })
    } catch (error) {
      return this.response.status(422).json({ message: `Dataset update failed: ${error}` })
    }
  }

  private async loadDataset(): Promise<Dataset | null> {
    const dataset = await Dataset.findBySlugOrPk(this.params.datasetIdOrSlug, {
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
        "creator",
        "file",
        "integration",
        "stewardship",
        "accessGrants",
        "accessRequests",
        "visualizationControl",
      ],
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
