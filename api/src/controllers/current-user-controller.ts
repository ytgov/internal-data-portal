import { Users } from "@/services"
import { UserSerializers } from "@/serializers"

import BaseController from "@/controllers/base-controller"

export class CurrentUserController extends BaseController {
  async show() {
    // See api/src/controllers/users/yg-government-directory-sync-controller.ts for force sync endpoint
    if (!this.currentUser.isTimeToSyncWithEmployeeDirectory()) {
      const serializedUser = UserSerializers.asDetailed(this.currentUser)
      return this.response.status(200).json({ user: serializedUser })
    }

    return Users.YukonGovernmentDirectorySyncService.perform(this.currentUser).then(
      (updatedUser) => {
        // TODO: consider changing interface to Users.AsDetailedSerializer.perform()?
        const serializedUser = UserSerializers.asDetailed(updatedUser)
        return this.response.status(200).json({ user: serializedUser })
      }
    )
  }
}

export default CurrentUserController
