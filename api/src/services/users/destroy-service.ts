import db, { Role, User, UserGroupMembership } from "@/models"

import BaseService from "@/services/base-service"

export class DestroyService extends BaseService {
  constructor(
    private user: User,
    private currentUser: User
  ) {
    super()
  }

  async perform(): Promise<void> {
    return db.transaction(async () => {
      await UserGroupMembership.destroy({ where: { userId: this.user.id } })
      await Role.destroy({ where: { userId: this.user.id } })
      await this.user.destroy()

      // TODO: log user action

      return
    })
  }
}

export default DestroyService
