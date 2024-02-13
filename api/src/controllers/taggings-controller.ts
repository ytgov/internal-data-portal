import { WhereOptions } from "sequelize"
import { isNil } from "lodash"

import { Dataset, Tagging } from "@/models"
import { Taggable, TaggableTypes } from "@/models/tagging"
import { DatasetsPolicy } from "@/policies"
import { CreateService } from "@/services/taggings"

import BaseController from "@/controllers/base-controller"

export class TaggingsController extends BaseController {
  async index() {
    const where = this.query.where as WhereOptions<Tagging>
    console.log(`where:`, where)
    const totalCount = await Tagging.count({ where })
    const taggings = await Tagging.findAll({
      where,
      limit: this.pagination.limit,
      offset: this.pagination.offset,
      include: ["tag"],
      // TODO: consider ordering in the front-end, to avoid OS specific ordering issues.
      order: [["tag", "name", "ASC"]],
    })

    return this.response.json({ taggings, totalCount })
  }

  async create() {
    const taggable = await this.loadTaggable()
    // TODO: consider if this should return a 403 to prevent an enumeration attack.
    if (isNil(taggable)) {
      return this.response.status(404).json({ message: "Taggable not found." })
    }

    const policy = this.buildPolicy(taggable)
    if (!policy.create()) {
      return this.response
        .status(403)
        .json({ message: "You are not authorized to create taggings against this taggable." })
    }

    try {
      const tagging = await CreateService.perform(this.request.body, this.currentUser)
      return this.response.status(201).json({ tagging })
    } catch (error) {
      return this.response.status(422).json({ message: `Tagging creation failed: ${error}` })
    }
  }

  private async loadTaggable(): Promise<Dataset | null> {
    const { taggableType, taggableId } = this.request.body
    if (taggableType === TaggableTypes.DATASET) {
      return Dataset.findByPk(taggableId)
    } else {
      throw new Error(`Unsupported taggableType: ${taggableType}`)
    }
  }

  private buildPolicy(taggable: Taggable) {
    if (taggable instanceof Dataset) {
      return new DatasetsPolicy(this.currentUser, taggable)
    } else {
      throw new Error("Could not build policy for taggable")
    }
  }
}

export default TaggingsController
