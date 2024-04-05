import { isNil } from "lodash"

import { DatasetIntegration, User } from "@/models"
import { DatasetIntegrationStatusTypes } from "@/models/dataset-integration"

import BaseService from "@/services/base-service"

type Attributes = Partial<DatasetIntegration>

export class CreateService extends BaseService {
  constructor(
    private attributes: Attributes,
    private currentUser: User
  ) {
    super()
  }

  async perform(): Promise<DatasetIntegration> {
    const { datasetId, url, ...optionalAttributes } = this.attributes

    if (isNil(datasetId)) {
      throw new Error("datasetId is required")
    }

    if (isNil(url)) {
      throw new Error("url is required")
    }

    const datasetIntegration = DatasetIntegration.build({
      datasetId,
      url,
      status: DatasetIntegrationStatusTypes.PENDING,
      ...optionalAttributes,
    })
    await datasetIntegration.activate()

    // TODO: log creating user

    return datasetIntegration.save()
  }
}

export default CreateService
