import { DatasetIntegration, User } from "@/models"

import BaseService from "@/services/base-service"

type Attributes = Partial<DatasetIntegration>

export class UpdateService extends BaseService {
  constructor(
    private datasetIntegration: DatasetIntegration,
    private attributes: Attributes,
    private currentUser: User
  ) {
    super()
  }

  async perform(): Promise<DatasetIntegration> {
    await this.datasetIntegration.update(this.attributes)

    // TODO: log user action

    return this.datasetIntegration
  }
}

export default UpdateService
