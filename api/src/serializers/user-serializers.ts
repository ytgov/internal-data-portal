import { pick } from "lodash"

import { User, Role } from "@/models"
import { type RoleTypes } from "@/models/role"

import BaseSerializer from "@/serializers/base-serializer"

export type UserDetailedView = Omit<Partial<User>, "roles"> & {
  displayName: string
  roleTypes: RoleTypes[]
  roles: Partial<Role>[]
}

export class UserSerializers extends BaseSerializer<User> {
  static asDetailedTable(users: User[]): UserDetailedView[] {
    return users.map((user) => this.asDetailed(user))
  }

  static asDetailed(user: User): UserDetailedView {
    const serializer = new this(user)
    return serializer.asDetailed()
  }

  asDetailed(): UserDetailedView {
    // Note that "auth0Subject" (Auth0 subject attribute) is a restricted field.
    return {
      ...pick(this.record.dataValues, [
        "id",
        "email",
        "firstName",
        "lastName",
        "position",
        "department",
        "division",
        "branch",
        "unit",
        "createdAt",
        "updatedAt",
      ]),
      roleTypes: this.record.roleTypes,
      displayName: `${this.record.firstName} ${this.record.lastName}`,
      // associations
      // TODO: replace with role serializers
      roles:
        this.record.roles?.map((role) =>
          pick(role, ["id", "userId", "role", "createdAt", "updatedAt"])
        ) || [],
    }
  }
}

export default UserSerializers
