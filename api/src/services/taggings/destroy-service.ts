import db, { Tag, Tagging, User } from "@/models"

import BaseService from "@/services/base-service"

export class DestroyService extends BaseService {
  constructor(
    private tagging: Tagging,
    private currentUser: User
  ) {
    super()
  }

  async perform(): Promise<void> {
    return db.transaction(async () => {
      const { tagId } = this.tagging

      await this.tagging.destroy()

      const taggingsCount = await Tagging.count({ where: { tagId } })
      if (taggingsCount === 0) {
        await Tag.destroy({ where: { id: tagId } })
      }

      // TODO: log acting user

      return
    })
  }
}

export default DestroyService
