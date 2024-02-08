import { WhereOptions } from "sequelize"
import { isNil } from "lodash"

import { Dataset, StewardshipEvolution, User } from "@/models"
import { DatasetsPolicy } from "@/policies"
import { assertDatasetPolicyRecord, type DatasetPolicyRecord } from "@/policies/datasets-policy"
import { CreateService } from "@/services/datasets"
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
        "creator",
        {
          association: "stewardshipEvolutions",
          order: [["createdAt", "DESC"]],
        },
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

  private async loadDataset(): Promise<DatasetPolicyRecord | null> {
    const dataset = await Dataset.findBySlugOrPk(this.params.datasetIdOrSlug, {
      include: ["owner", "creator", "stewardshipEvolutions"],
    })

    return dataset as
      | (Dataset & {
          owner: User
          creator: User
          stewardshipEvolutions: StewardshipEvolution[]
        })
      | null
  }

  private async buildDataset(): Promise<DatasetPolicyRecord> {
    const attributes = this.request.body

    // Sadly "include" does not work in "build".
    // And also the "getOwner" function does not inject the owner into the dataset.
    const dataset = Dataset.build(attributes)
    dataset.owner = await dataset.getOwner({
      include: [
        "roles",
        {
          association: "groupMembership",
          include: ["department", "division", "branch", "unit"],
        },
      ],
    })

    // TypeScript garbage because inline check doesn't change type
    assertDatasetPolicyRecord(dataset)

    return dataset
  }

  private buildPolicy(record: DatasetPolicyRecord): DatasetsPolicy {
    return new DatasetsPolicy(this.currentUser, record)
  }
}

export default DatasetsController
