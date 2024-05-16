import db, { DatasetField, DatasetIntegration, User } from "@/models"
import { DatasetIntegrations } from "@/services"

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
      await DatasetIntegrations.RefreshService.perform(this.datasetIntegration)
      await DatasetIntegrations.ApplyJMESPathTransformService.perform(this.datasetIntegration)

      if (!(await this.hasDataSetFields())) {
        await DatasetIntegrations.BulkReplaceDatasetFieldsService.perform(this.datasetIntegration)
      }

      await DatasetIntegrations.BulkReplaceDatasetEntriesService.perform(this.datasetIntegration)
      // TODO: log user action

      return this.datasetIntegration.save()
    })
  }

  // TODO: consider if we should always add fields, but mark them as hidden by default
  private async hasDataSetFields(): Promise<boolean> {
    const { datasetId } = this.datasetIntegration
    const count = await DatasetField.count({
      where: {
        datasetId,
      },
    })

    return count > 0
  }
}

export default CreateService
