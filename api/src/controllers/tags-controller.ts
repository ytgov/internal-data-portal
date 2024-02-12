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
      // TODO: consider ordering in the front-end, to avoid OS specific ordering issues.
      order: [["name", "ASC"]],
    })

    return this.response.json({ tags, totalCount })
  }
}

export default TagsController
