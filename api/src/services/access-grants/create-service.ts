import { isNil } from "lodash"

import { AccessGrant, User } from "@/models"

import BaseService from "@/services/base-service"

type Attributes = Partial<AccessGrant>

export class CreateService extends BaseService {
  constructor(
    private attributes: Attributes,
    private currentUser: User
  ) {
    super()
  }

  async perform(): Promise<AccessGrant> {
    const { datasetId, grantLevel, accessType, ...optionalAttributes } = this.attributes

    if (isNil(datasetId)) {
      throw new Error("datasetId is required")
    }

    if (isNil(grantLevel)) {
      throw new Error("grantLevel is required")
    }

    if (isNil(accessType)) {
      throw new Error("accessType is required")
    }

    const datasetField = await AccessGrant.create({
      datasetId,
      grantLevel,
      accessType,
      ...optionalAttributes,
      creatorId: this.currentUser.id,
    })

    // TODO: log user action

    return datasetField
  }
}

export default CreateService
