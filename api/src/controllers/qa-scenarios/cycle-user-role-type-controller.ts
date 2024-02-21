import { isNil } from "lodash"

import { Role } from "@/models"
import { RoleTypes } from "@/models/role"

import BaseController from "@/controllers/base-controller"

// Keep in sync with web/src/components/qa-scenarios/QaScenariosCard.vue
const ORDERED_ROLE_TYPES = [
  RoleTypes.USER,
  RoleTypes.DATA_OWNER,
  RoleTypes.BUSINESS_ANALYST,
  RoleTypes.SYSTEM_ADMIN,
]

export class CycleUserRoleTypeController extends BaseController {
  async create() {
    console.warn("This should not be running in production!")

    try {
      const newRoleType = this.determineNextRole()
      await this.replaceUserRolesWith(newRoleType)
      return this.response.status(201).json({ message: `Cycled user role to ${newRoleType}` })
    } catch (error) {
      return this.response.status(422).json({ message: `Could not cycle user role: ${error}` })
    }
  }

  private async replaceUserRolesWith(newRoleType: RoleTypes): Promise<void> {
    await Role.destroy({ where: { userId: this.currentUser.id }, force: true })
    await Role.create({
      userId: this.currentUser.id,
      role: newRoleType,
    })
    return
  }

  private determineNextRole(): RoleTypes {
    if (isNil(this.currentUser)) {
      throw new Error("No current user")
    }

    const { roleTypes } = this.currentUser
    const currentRoleType = roleTypes[0]
    if (isNil(currentRoleType)) {
      throw new Error("Current user has no roles")
    }

    const currentIndex = ORDERED_ROLE_TYPES.indexOf(currentRoleType)
    const nextIndex = (currentIndex + 1) % 4
    return ORDERED_ROLE_TYPES[nextIndex]
  }
}

export default CycleUserRoleTypeController
