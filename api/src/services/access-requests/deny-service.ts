import { AccessRequest, User } from "@/models"

import BaseService from "@/services/base-service"

type Attributes = Partial<Pick<AccessRequest, "denialReason">>

export class DenyService extends BaseService {
  constructor(
    private accessRequest: AccessRequest,
    private attributes: Attributes,
    private currentUser: User
  ) {
    super()
  }

  async perform(): Promise<AccessRequest> {
    await this.accessRequest.update({
      denialReason: this.attributes.denialReason,
      deniedAt: new Date(),
      denierId: this.currentUser.id,
    })

    // TODO: log user action

    return this.accessRequest
  }
}

export default DenyService
