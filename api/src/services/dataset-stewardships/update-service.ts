import { DatasetStewardship, User } from "@/models"

import BaseService from "@/services/base-service"

type Attributes = Partial<DatasetStewardship>

export class UpdateService extends BaseService {
  constructor(
    private datasetStewardship: DatasetStewardship,
    private attributes: Attributes,
    private currentUser: User
  ) {
    super()
  }

  async perform(): Promise<DatasetStewardship> {
    await this.datasetStewardship.update(this.attributes)

    // TODO: log user who performed update?

    return this.datasetStewardship
  }
}

export default UpdateService
