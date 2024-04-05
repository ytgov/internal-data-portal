import { isNil, isString } from "lodash"

import db, { DatasetEntry, DatasetIntegration, User } from "@/models"

import BaseService from "@/services/base-service"
import { CreationAttributes } from "sequelize"
import { DatasetEntryJsonDataType } from "@/models/dataset-entry"

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
        await this.datasetIntegration.refresh()
        return this.datasetIntegration.save()
      }

      await this.datasetIntegration.refresh()
      await this.datasetIntegration.applyJMESPathTransform()
      // TODO: create fields if none exist during dataset import
      await this.bulkReplaceDatasetEntries(this.datasetIntegration)

      // TODO: log user action

      return this.datasetIntegration.save()
    })
  }

  private async bulkReplaceDatasetEntries(datasetIntegration: DatasetIntegration) {
    const { datasetId, parsedJsonData } = datasetIntegration

    await DatasetEntry.destroy({
      where: {
        datasetId,
      },
    })

    if (isNil(parsedJsonData)) {
      throw new Error("An integration must have data to build data entries.")
    }

    const datasetEntriesAttributes: CreationAttributes<DatasetEntry>[] = parsedJsonData.map(
      (rawJsonData) => {
        let jsonData: DatasetEntryJsonDataType
        if (isString(rawJsonData)) {
          jsonData = {
            value: rawJsonData,
          } as DatasetEntryJsonDataType
        } else {
          jsonData = rawJsonData as DatasetEntryJsonDataType
        }

        return {
          datasetId,
          rawJsonData,
          jsonData,
        }
      }
    )
    await DatasetEntry.bulkCreate(datasetEntriesAttributes)
    return
  }
}

export default UpdateService
