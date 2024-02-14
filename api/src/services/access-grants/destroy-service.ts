import { AccessGrant, User } from "@/models"

import BaseService from "@/services/base-service"

export class DestroyService extends BaseService {
  constructor(
    private accessGrant: AccessGrant,
    private currentUser: User
  ) {
    super()
  }

  async perform(): Promise<void> {
    await this.accessGrant.destroy()

    // TODO: log user action

    return
  }
}

export default DestroyService
