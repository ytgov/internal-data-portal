import { WhereOptions } from "sequelize"

import { Tagging } from "@/models"

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
}

export default TaggingsController
