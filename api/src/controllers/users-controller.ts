import { WhereOptions } from "sequelize"

import { User } from "@/models"
import { UserSerializers } from "@/serializers"

import BaseController from "@/controllers/base-controller"

export class UsersController extends BaseController {
  async index() {
    const where = this.query.where as WhereOptions<User>

    const totalCount = await User.count({ where })
    const users = await User.findAll({
      where,
      limit: this.pagination.limit,
      offset: this.pagination.offset,
      include: ["roles"],
    })

    const serializedUsers = UserSerializers.asDetailedTable(users)
    return this.response.json({ users: serializedUsers, totalCount })
  }
}

export default UsersController
