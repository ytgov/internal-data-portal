import { WhereOptions } from "sequelize"

import { UserGroup } from "@/models"

import BaseController from "@/controllers/base-controller"

export class UserGroupsController extends BaseController {
  async index() {
    const where = this.query.where as WhereOptions<UserGroup>

    const totalCount = await UserGroup.count({ where })
    const userGroups = await UserGroup.findAll({
      where,
      limit: this.pagination.limit,
      offset: this.pagination.offset,
      // TODO: consider including children?
      // include: ["children"],
      order: [["order", "ASC"]],
    })

    return this.response.json({ userGroups, totalCount })
  }
}

export default UserGroupsController
