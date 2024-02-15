import { WhereOptions } from "sequelize"
import { isNil } from "lodash"

import { User } from "@/models"
import { UserSerializers } from "@/serializers"
import { UsersPolicy } from "@/policies"

import BaseController from "@/controllers/base-controller"

export class UsersController extends BaseController {
  async index() {
    const where = this.query.where as WhereOptions<User>

    const totalCount = await User.count({ where })
    const users = await User.findAll({
      where,
      limit: this.pagination.limit,
      offset: this.pagination.offset,
      include: [
        "roles",
        {
          association: "groupMembership",
          include: ["department", "division", "branch", "unit"],
        },
      ],
    })

    const serializedUsers = UserSerializers.asDetailedTable(users)
    return this.response.json({ users: serializedUsers, totalCount })
  }

  async show() {
    const user = await this.loadUser()
    if (isNil(user)) {
      return this.response.status(404).json({ message: "User not found." })
    }

    const policy = this.buildPolicy(user)
    if (!policy.show()) {
      return this.response
        .status(403)
        .json({ message: "You are not authorized to view this user." })
    }

    try {
      // TODO: consider using a less detailed serializer for showing non-current user?
      const serializedUser = UserSerializers.asDetailed(user)
      return this.response.status(200).json({ user: serializedUser })
    } catch (error) {
      return this.response.status(422).json({ message: `User serialization failed: ${error}` })
    }
  }

  private async loadUser() {
    return User.findByPk(this.params.userId, {
      include: [
        "roles",
        {
          association: "groupMembership",
          include: ["department", "division", "branch", "unit"],
        },
      ],
    })
  }

  private buildPolicy(user: User) {
    return new UsersPolicy(this.currentUser, user)
  }
}

export default UsersController
