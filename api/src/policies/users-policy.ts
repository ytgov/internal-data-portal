import { User } from "@/models"
import { RoleTypes } from "@/models/role"

import BasePolicy from "@/policies/base-policy"

export class UsersPolicy extends BasePolicy<User> {
  /**
   * User information is always public
   */
  show(): boolean {
    return true
  }

  update(): boolean {
    if (this.user.roleTypes.includes(RoleTypes.SYSTEM_ADMIN)) return true
    if (this.user.id === this.record.id) return true

    return false
  }
}

export default UsersPolicy
