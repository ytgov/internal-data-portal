import { UserGroup } from "@/models"
import { RoleTypes } from "@/models/role"

import BasePolicy from "@/policies/base-policy"

export class UserGroupsPolicy extends BasePolicy<UserGroup> {
  create(): boolean {
    if (this.user.roleTypes.includes(RoleTypes.SYSTEM_ADMIN)) return true

    return false
  }
}

export default UserGroupsPolicy
