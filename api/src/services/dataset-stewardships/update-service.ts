import db, { Dataset, DatasetStewardship, User } from "@/models"

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
    return db.transaction(async () => {
      this.datasetStewardship.set(this.attributes)

      await this.propagateOwnerChangeToDataset(this.datasetStewardship)

      // TODO: log user who performed update?

      return this.datasetStewardship.save()
    })
  }

  /**
   * TODO: figure out how to make this code unnecessary.
   * I probably shouldn't have made the dataset stewardship
   * have a separate ownerId field than the dataset.
   */
  private async propagateOwnerChangeToDataset(
    datasetStewardship: DatasetStewardship
  ): Promise<void> {
    if (datasetStewardship.changed("ownerId")) {
      await Dataset.update(
        { ownerId: datasetStewardship.ownerId },
        { where: { id: datasetStewardship.datasetId } }
      )
    }
  }
}

export default UpdateService
