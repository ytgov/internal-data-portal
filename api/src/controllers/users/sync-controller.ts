import { isNil } from "lodash"

import { User } from "@/models"
import { SyncService } from "@/services/users"
import { UserSerializers } from "@/serializers"
import { UsersPolicy } from "@/policies"
import BaseController from "@/controllers/base-controller"

export class SyncController extends BaseController {
  async create() {
    const user = await this.loadUser()
    if (isNil(user)) return this.response.status(404).json({ message: "User not found." })

    const policy = this.buildPolicy(user)
    if (!policy.update()) {
      return this.response
        .status(403)
        .json({ message: "You are not authorized to sync this user." })
    }

    try {
      const updatedUser = await SyncService.perform(user)
      const serializedUser = UserSerializers.asDetailed(updatedUser)
      return this.response.status(201).json({ user: serializedUser })
    } catch (error) {
      return this.response.status(422).json({ message: `Failed to sync user: ${error}` })
    }
  }

  private loadUser(): Promise<User | null> {
    return User.findByPk(this.params.userId)
  }

  private buildPolicy(record: User): UsersPolicy {
    return new UsersPolicy(this.currentUser, record)
  }
}

export default SyncController
