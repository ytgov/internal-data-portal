import { WhereOptions } from "sequelize"

import { Tag } from "@/models"

import BaseController from "@/controllers/base-controller"

export class TagsController extends BaseController {
  async index() {
    const where = this.query.where as WhereOptions<Tag>

    const totalCount = await Tag.count({ where })
    const tags = await Tag.findAll({
      where,
      limit: this.pagination.limit,
      offset: this.pagination.offset,
      order: [["name", "ASC"]],
    })

    return this.response.json({ tags, totalCount })
  }
}

export default TagsController
