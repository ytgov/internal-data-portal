import { AccessRequest, User } from "@/models"

import BaseService from "@/services/base-service"

export class RevokeService extends BaseService {
  constructor(
    private accessRequest: AccessRequest,
    private currentUser: User
  ) {
    super()
  }

  async perform(): Promise<AccessRequest> {
    await this.accessRequest.update({
      revokedAt: new Date(),
      revokerId: this.currentUser.id,
    })

    // TODO: log user action

    return this.accessRequest
  }
}

export default RevokeService
