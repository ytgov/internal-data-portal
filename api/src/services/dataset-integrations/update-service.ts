import db, { DatasetField, DatasetIntegration, User } from "@/models"
import {
  ApplyJMESPathTransformService,
  BulkReplaceDatasetEntriesService,
  BulkReplaceDatasetFieldsService,
  RefreshService,
} from "@/services/dataset-integrations"

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
      await ApplyJMESPathTransformService.perform(this.datasetIntegration)

      if (!(await this.hasDataSetFields())) {
        await BulkReplaceDatasetFieldsService.perform(this.datasetIntegration)
      }

      await BulkReplaceDatasetEntriesService.perform(this.datasetIntegration)

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

export default UpdateService
