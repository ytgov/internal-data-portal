import db, { DatasetIntegration, User } from "@/models"

import BaseService from "@/services/base-service"

/**
 * Note that will this is currently the same as the dataset-integrations/update-service.ts;
 * however, its purpose is not quite the same, so keeping it separate for now despite the duplication.
 */
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
