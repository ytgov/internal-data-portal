import { ModelStatic, WhereOptions } from "sequelize"
import { isEmpty, isNil } from "lodash"

import { User } from "@/models"
import { UserSerializers } from "@/serializers"
import { UsersPolicy } from "@/policies"
import { CreateService, DestroyService, UpdateService } from "@/services/users"

import BaseController from "@/controllers/base-controller"

export class UsersController extends BaseController {
  async index() {
    const where = this.query.where as WhereOptions<User>
    const filters = this.query.filters as Record<string, unknown>

    let filteredUsers: ModelStatic<User> = User
    if (!isEmpty(filters)) {
      Object.entries(filters).forEach(([key, value]) => {
        filteredUsers = filteredUsers.scope({ method: [key, value] })
      })
    }

    const totalCount = await filteredUsers.count({ where })
    const users = await filteredUsers.findAll({
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
    const withDeleted = this.query.withDeleted === "true"
    const user = await this.loadUser({
      withDeleted,
    })
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

  async create() {
    const user = await this.buildUser()
    const policy = this.buildPolicy(user)
    if (!policy.create()) {
      return this.response
        .status(403)
        .json({ message: "You are not authorized to create a user with these properties." })
    }

    const permittedAttributes = policy.permitAttributesForCreate(this.request.body)
    try {
      const newUser = await CreateService.perform(permittedAttributes, this.currentUser)
      const serializedUser = UserSerializers.asDetailed(newUser)
      return this.response.status(201).json({ user: serializedUser })
    } catch (error) {
      return this.response.status(422).json({ message: `User creation failed: ${error}` })
    }
  }

  async update() {
    const user = await this.loadUser()
    if (isNil(user)) {
      return this.response.status(404).json({ message: "User not found." })
    }

    const policy = this.buildPolicy(user)
    if (!policy.update()) {
      return this.response
        .status(403)
        .json({ message: "You are not authorized to update this user." })
    }

    const permittedAttributes = policy.permitAttributesForUpdate(this.request.body)
    try {
      const updatedUser = await UpdateService.perform(user, permittedAttributes, this.currentUser)
      const serializedUser = UserSerializers.asDetailed(updatedUser)
      return this.response.status(200).json({ user: serializedUser })
    } catch (error) {
      return this.response.status(422).json({ message: `User update failed: ${error}` })
    }
  }

  async destroy() {
    const user = await this.loadUser()
    if (isNil(user)) {
      return this.response.status(404).json({ message: "User not found." })
    }

    const policy = this.buildPolicy(user)
    if (!policy.update()) {
      return this.response
        .status(403)
        .json({ message: "You are not authorized to delete this user." })
    }

    try {
      await DestroyService.perform(user, this.currentUser)
      return this.response.status(204).end()
    } catch (error) {
      return this.response.status(422).json({ message: `User delete failed: ${error}` })
    }
  }

  private async buildUser() {
    return User.build(this.request.body)
  }

  private async loadUser({ withDeleted = false }: { withDeleted?: boolean } = {}) {
    return User.findByPk(this.params.userId, {
      paranoid: !withDeleted,
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
