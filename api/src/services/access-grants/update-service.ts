import { AccessGrant, User } from "@/models"

import BaseService from "@/services/base-service"

type Attributes = Partial<AccessGrant>

export class UpdateService extends BaseService {
  constructor(
    private accessGrant: AccessGrant,
    private attributes: Attributes,
    private currentUser: User
  ) {
    super()
  }

  async perform(): Promise<AccessGrant> {
    await this.accessGrant.update(this.attributes)

    // TODO: log user action

    return this.accessGrant
  }
}

export default UpdateService
