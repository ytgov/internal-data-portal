import { isNil } from "lodash"

import { DatasetField, User } from "@/models"

import BaseService from "@/services/base-service"

type Attributes = Partial<DatasetField>

export class CreateService extends BaseService {
  constructor(
    private attributes: Attributes,
    private currentUser: User
  ) {
    super()
  }

  async perform(): Promise<DatasetField> {
    const { datasetId, name, displayName, dataType } = this.attributes

    if (isNil(datasetId)) {
      throw new Error("datasetId is required")
    }

    if (isNil(name)) {
      throw new Error("name is required")
    }

    if (isNil(displayName)) {
      throw new Error("displayName is required")
    }

    if (isNil(dataType)) {
      throw new Error("dataType is required")
    }

    const datasetField = await DatasetField.create({
      datasetId,
      name,
      displayName,
      dataType,
      ...this.attributes,
    })

    // TODO: log creating user

    return datasetField
  }
}

export default CreateService
