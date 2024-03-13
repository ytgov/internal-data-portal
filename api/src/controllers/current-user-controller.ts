import { SyncService } from "@/services/users"
import { UserSerializers } from "@/serializers"

import BaseController from "@/controllers/base-controller"

export class CurrentUserController extends BaseController {
  async show() {
    // See api/src/controllers/users/yg-government-directory-sync-controller.ts for force sync endpoint
    if (!this.currentUser.isTimeToSyncWithEmployeeDirectory()) {
      const serializedUser = UserSerializers.asDetailed(this.currentUser)
      return this.response.status(200).json({ user: serializedUser })
    }

    try {
      const updatedUser = await SyncService.perform(this.currentUser)
      const serializedUser = UserSerializers.asDetailed(updatedUser)
      return this.response.status(200).json({ user: serializedUser })
    } catch (error) {
      return this.response.status(422).json({ message: `Failed to sync user: ${error}` })
    }
  }
}

export default CurrentUserController
