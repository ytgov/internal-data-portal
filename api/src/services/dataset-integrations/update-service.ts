import { isArray, isNil, isString } from "lodash"
import jmespath from "jmespath"

import db, { DatasetEntry, DatasetIntegration, User } from "@/models"

import BaseService from "@/services/base-service"
import { CreationAttributes } from "sequelize"
import { DatasetEntryJsonDataType } from "@/models/dataset-entry"

type Attributes = Partial<DatasetIntegration>

export class UpdateService extends BaseService {
  constructor(
    private datasetIntegration: DatasetIntegration,
    private attributes: Attributes,
    private isPreview: boolean,
    private currentUser: User
  ) {
    super()
  }

  async perform(): Promise<DatasetIntegration> {
    return db.transaction(async () => {
      this.datasetIntegration.set(this.attributes)
      await this.datasetIntegration.refresh()
      await this.datasetIntegration.save()

      if (this.isPreview !== true) {
        await this.parseJsonData(this.datasetIntegration)
        // TODO: create fields if none exist during dataset import
        await this.bulkReplaceDatasetEntries(this.datasetIntegration)
      }

      // TODO: log user action

      return this.datasetIntegration
    })
  }

  private async parseJsonData(datasetIntegration: DatasetIntegration) {
    const { rawJsonData, jmesPathTransform } = datasetIntegration

    if (isNil(rawJsonData)) {
      throw new Error("An integration must have data to be parsed.")
    }

    if (isNil(jmesPathTransform) && isArray(rawJsonData)) {
      return datasetIntegration.update({
        parsedJsonData: rawJsonData,
      })
    }

    if (isNil(jmesPathTransform)) {
      throw new Error("An integration must parse to an array to be valid")
    }

    const parsedJsonData = jmespath.search(rawJsonData, jmesPathTransform)
    return datasetIntegration.update({
      parsedJsonData,
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
