import { isNil } from "lodash"

import { User } from "@/models"
import { Users } from "@/services"
import { UserSerializers } from "@/serializers"
import { UsersPolicy } from "@/policies"
import BaseController from "@/controllers/base-controller"

export class YukonGovernmentDirectorySyncController extends BaseController {
  async create() {
    const user = await this.loadUser()
    if (isNil(user)) return this.response.status(404).json({ message: "User not found." })

    const policy = this.buildPolicy(user)
    if (!policy.update()) {
      return this.response
        .status(403)
        .json({ message: "You are not authorized to sync this user." })
    }

    return Users.YukonGovernmentDirectorySyncService.perform(this.currentUser).then((user) => {
      const serializedUser = UserSerializers.asDetailed(user)
      return this.response.status(201).json({ user: serializedUser })
    })
  }

  private loadUser(): Promise<User | null> {
    return User.findByPk(this.params.userId)
  }

  private buildPolicy(record: User): UsersPolicy {
    return new UsersPolicy(this.currentUser, record)
  }
}

export default YukonGovernmentDirectorySyncController
