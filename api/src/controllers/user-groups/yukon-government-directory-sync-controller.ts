import { UserGroup } from "@/models"
import { UserGroups } from "@/services"
import { UserGroupsPolicy } from "@/policies"
import BaseController from "@/controllers/base-controller"

export class YukonGovernmentDirectorySyncController extends BaseController {
  async create() {
    const userGroup = await this.buildUserGroup()
    const policy = this.buildPolicy(userGroup)
    if (!policy.create()) {
      return this.response
        .status(403)
        .json({ message: "You are not authorized to sync user groups." })
    }

    const userGroups = UserGroups.YukonGovernmentDirectorySyncService.perform()
    return this.response.status(200).json({ userGroups })
  }

  private async buildUserGroup(): Promise<UserGroup> {
    return UserGroup.build()
  }

  private buildPolicy(record: UserGroup): UserGroupsPolicy {
    return new UserGroupsPolicy(this.currentUser, record)
  }
}

export default YukonGovernmentDirectorySyncController
