import { randomUUID } from "crypto"
import { isNil } from "lodash"

import { AccessGrant, AccessRequest, User } from "@/models"

import BaseService from "@/services/base-service"

type Attributes = Partial<AccessRequest>

export class CreateService extends BaseService {
  constructor(
    private attributes: Attributes,
    private currentUser: User
  ) {
    super()
  }

  async perform(): Promise<AccessRequest> {
    const { datasetId, requestorId, accessGrantId, ...optionalAttributes } = this.attributes

    const secureRequestorId = this.currentUser.isSystemAdmin ? requestorId : this.currentUser.id

    if (isNil(datasetId)) {
      throw new Error("datasetId is required")
    }

    const accessGrant = await AccessGrant.findByPk(accessGrantId)
    if (isNil(accessGrant)) {
      throw new Error("Access grant not found")
    }

    if (accessGrant.datasetId !== datasetId) {
      throw new Error("Access grant does not belong to the dataset")
    }

    if (accessGrant.isProjectDescriptionRequired && isNil(optionalAttributes.projectDescription)) {
      throw new Error("Project description is required")
    }

    if (isNil(secureRequestorId)) {
      throw new Error("requestorId is required")
    }

    if (isNil(accessGrantId)) {
      throw new Error("accessGrantId is required")
    }

    const datasetField = await AccessRequest.create({
      datasetId,
      requestorId: secureRequestorId,
      accessGrantId,
      accessCode: randomUUID(),
      ...optionalAttributes,
    })

    // TODO: log user action

    return datasetField
  }
}

export default CreateService
