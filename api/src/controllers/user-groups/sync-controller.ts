import { UserGroup } from "@/models"
import { SyncService } from "@/services/user-groups"
import { UserGroupsPolicy } from "@/policies"
import BaseController from "@/controllers/base-controller"

export class SyncController extends BaseController {
  async create() {
    const userGroup = await this.buildUserGroup()
    const policy = this.buildPolicy(userGroup)
    if (!policy.create()) {
      return this.response
        .status(403)
        .json({ message: "You are not authorized to sync user groups." })
    }

    try {
      const userGroups = await SyncService.perform()
      return this.response.status(201).json({ userGroups })
    } catch (error) {
      return this.response.status(422).json({ message: `Failed to sync user groups: ${error}` })
    }
  }

  private async buildUserGroup(): Promise<UserGroup> {
    return UserGroup.build()
  }

  private buildPolicy(record: UserGroup): UserGroupsPolicy {
    return new UserGroupsPolicy(this.currentUser, record)
  }
}

export default SyncController
