import { WhereOptions } from "sequelize"
import { isNil } from "lodash"

import { Dataset, AccessGrant } from "@/models"
import { AccessGrantsPolicy } from "@/policies"
import { AccessGrantWithDataset } from "@/policies/access-grants-policy"
import { CreateService, DestroyService, UpdateService } from "@/services/access-grants"

import BaseController from "@/controllers/base-controller"

export class AccessGrantsController extends BaseController {
  async index() {
    const where = this.query.where as WhereOptions<AccessGrant>

    const totalCount = await AccessGrant.count({ where })
    const accessGrants = await AccessGrant.findAll({
      where,
      limit: this.pagination.limit,
      offset: this.pagination.offset,
    })

    return this.response.json({ accessGrants, totalCount })
  }

  async create() {
    const accessGrant = await this.buildAccessGrant()
    if (isNil(accessGrant)) {
      return this.response.status(404).json({ message: "Dataset not found." })
    }

    const policy = this.buildPolicy(accessGrant)
    if (!policy.create()) {
      return this.response
        .status(403)
        .json({ message: "You are not authorized to add access grants for this dataset." })
    }

    const permittedAttributes = policy.permitAttributesForCreate(this.request.body)
    try {
      const accessGrant = await CreateService.perform(permittedAttributes, this.currentUser)
      return this.response.status(201).json({ accessGrant })
    } catch (error) {
      return this.response.status(422).json({ message: `Access grant creation failed: ${error}` })
    }
  }

  async update() {
    const accessGrant = await this.loadAccessGrant()
    if (isNil(accessGrant)) {
      return this.response.status(404).json({ message: "Access grant not found." })
    }

    const policy = this.buildPolicy(accessGrant)
    if (!policy.update()) {
      return this.response
        .status(403)
        .json({ message: "You are not authorized to update access grants on this dataset." })
    }

    const permittedAttributes = policy.permitAttributesForUpdate(this.request.body)
    try {
      const updatedAccessGrant = await UpdateService.perform(
        accessGrant,
        permittedAttributes,
        this.currentUser
      )
      return this.response.status(200).json({ accessGrant: updatedAccessGrant })
    } catch (error) {
      return this.response.status(422).json({ message: `Access grant update failed: ${error}` })
    }
  }

  async destroy() {
    const accessGrant = await this.loadAccessGrant()
    if (isNil(accessGrant)) {
      return this.response.status(404).json({ message: "Access grant not found." })
    }

    const policy = this.buildPolicy(accessGrant)
    if (!policy.update()) {
      return this.response
        .status(403)
        .json({ message: "You are not authorized to remove access grants on this dataset." })
    }

    try {
      await DestroyService.perform(accessGrant, this.currentUser)
      return this.response.status(204).end()
    } catch (error) {
      return this.response
        .status(422)
        .json({ message: `Access grant removal failed: ${error}` })
    }
  }

  private async buildAccessGrant(): Promise<AccessGrantWithDataset | null> {
    const accessGrant = AccessGrant.build(this.request.body)
    if (isNil(accessGrant)) return null

    const { datasetId } = this.request.body
    if (isNil(datasetId)) return null

    const dataset = await Dataset.findByPk(datasetId)
    if (isNil(dataset)) return null

    accessGrant.dataset = dataset

    // TODO: figure out how to make this type cast unneccessary
    return accessGrant as AccessGrantWithDataset
  }

  private async loadAccessGrant(): Promise<AccessGrantWithDataset | null> {
    const { accessGrantId } = this.request.params
    const accessGrant = await AccessGrant.findByPk(accessGrantId, { include: ["dataset"] })
    if (isNil(accessGrant?.dataset)) return null

    // TODO: figure out how to make this type cast unneccessary
    return accessGrant as AccessGrantWithDataset
  }

  private buildPolicy(accessGrant: AccessGrantWithDataset) {
    return new AccessGrantsPolicy(this.currentUser, accessGrant)
  }
}

export default AccessGrantsController
