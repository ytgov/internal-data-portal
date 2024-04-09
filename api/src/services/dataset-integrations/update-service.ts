import db, { DatasetIntegration, User } from "@/models"
import { RefreshService } from "@/services/dataset-integrations"

import BaseService from "@/services/base-service"

type Attributes = Partial<DatasetIntegration>

export class UpdateService extends BaseService {
  constructor(
    private datasetIntegration: DatasetIntegration,
    private attributes: Attributes,
    private currentUser: User,
    private controlFlags: { skipDataProcessing: boolean }
  ) {
    super()
  }

  async perform(): Promise<DatasetIntegration> {
    return db.transaction(async () => {
      this.datasetIntegration.set(this.attributes)

      if (this.controlFlags.skipDataProcessing) {
        await RefreshService.perform(this.datasetIntegration)
        return this.datasetIntegration.save()
      }

      await RefreshService.perform(this.datasetIntegration)
      await this.datasetIntegration.applyJMESPathTransform()
      // TODO: create fields if none exist during dataset import
      await this.datasetIntegration.bulkReplaceDatasetEntries()

      // TODO: log user action

      return this.datasetIntegration.save()
    })
  }
}

export default UpdateService
