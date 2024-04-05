import db, { DatasetIntegration, User } from "@/models"

import BaseService from "@/services/base-service"

// TODO: reduce massive duplication with
// api/src/services/dataset-integrations/update-service.ts
export class CreateService extends BaseService {
  constructor(
    private datasetIntegration: DatasetIntegration,
    private currentUser: User
  ) {
    super()
  }

  async perform(): Promise<DatasetIntegration> {
    return db.transaction(async () => {
      await this.datasetIntegration.refresh()

      await this.datasetIntegration.applyJMESPathTransform()
      // TODO: create fields if none exist during dataset import
      await this.datasetIntegration.bulkReplaceDatasetEntries()

      // TODO: log user action

      return this.datasetIntegration.save()
    })
  }
}

export default CreateService
