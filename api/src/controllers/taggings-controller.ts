import { WhereOptions } from "sequelize"
import { isNil } from "lodash"

import { Dataset, Tagging } from "@/models"
import { Taggable, TaggableTypes } from "@/models/tagging"
import { DatasetsPolicy } from "@/policies"
import { CreateService, DestroyService } from "@/services/taggings"

import BaseController from "@/controllers/base-controller"

export class TaggingsController extends BaseController {
  async index() {
    const where = this.query.where as WhereOptions<Tagging>

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
    if (isNil(taggable)) {
      return this.response.status(404).json({ message: "Taggable not found." })
    }

    const policy = this.buildTaggablePolicy(taggable)
    if (!policy.update()) {
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

  async destroy() {
    const tagging = await this.loadTagging()
    if (isNil(tagging)) {
      return this.response.status(404).json({ message: "Tagging not found." })
    } else if (isNil(tagging.taggable)) {
      return this.response.status(404).json({ message: "Taggable not found." })
    }

    const policy = this.buildTaggablePolicy(tagging.taggable)
    if (!policy.update()) {
      return this.response
        .status(403)
        .json({ message: "You are not authorized to destroy this tagging." })
    }

    try {
      await DestroyService.perform(tagging, this.currentUser)
      return this.response.status(204).end()
    } catch (error) {
      return this.response.status(422).json({ message: `Tagging destruction failed: ${error}` })
    }
  }

  private async loadTagging(): Promise<Tagging | null> {
    const { taggingId } = this.params
    const tagging = await Tagging.findByPk(taggingId)
    if (isNil(tagging)) return null

    const taggable = await tagging.getTaggable()
    if (isNil(taggable)) return null

    tagging.taggable = taggable
    return tagging
  }

  private async loadTaggable(): Promise<Dataset | null> {
    const { taggableType, taggableId } = this.request.body
    if (taggableType === TaggableTypes.DATASET) {
      return Dataset.findByPk(taggableId)
    } else {
      throw new Error(`Unsupported taggableType: ${taggableType}`)
    }
  }

  private buildTaggablePolicy(taggable: Taggable) {
    if (taggable instanceof Dataset) {
      return new DatasetsPolicy(this.currentUser, taggable)
    } else {
      throw new Error("Could not build policy for taggable")
    }
  }
}

export default TaggingsController
