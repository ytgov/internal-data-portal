import db, { Dataset, Role, User, UserGroupMembership } from "@/models"

import BaseService from "@/services/base-service"

export class DestroyService extends BaseService {
  constructor(
    private user: User,
    private currentUser: User
  ) {
    super()
  }

  async perform(): Promise<void> {
    const datasetsWithOwner = await Dataset.findAll({
      where: { ownerId: this.user.id },
    })
    if (datasetsWithOwner.length > 0) {
      const datasetNames = datasetsWithOwner.map((dataset) => dataset.name).join(", ")
      throw new Error(
        `Cannot delete user as they are the owner of the following datasets: ${datasetNames}.`
      )
    }

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
