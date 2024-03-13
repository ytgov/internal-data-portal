import { ModelStatic, WhereOptions } from "sequelize"
import { isEmpty } from "lodash"

import { Tag } from "@/models"

import BaseController from "@/controllers/base-controller"

export class TagsController extends BaseController {
  async index() {
    const where = this.query.where as WhereOptions<Tag>
    const searchToken = this.query.searchToken as string

    let filteredTags: ModelStatic<Tag> = Tag
    if (!isEmpty(searchToken)) {
      filteredTags = Tag.scope({ method: ["search", searchToken] })
    }

    const totalCount = await filteredTags.count({ where })
    const tags = await filteredTags.findAll({
      where,
      limit: this.pagination.limit,
      offset: this.pagination.offset,
      order: [["name", "ASC"]],
    })

    return this.response.json({ tags, totalCount })
  }
}

export default TagsController
