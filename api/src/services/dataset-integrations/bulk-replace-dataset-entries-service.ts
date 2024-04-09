import { isNil, isString } from "lodash"
import { CreationAttributes } from "sequelize"

import db, { DatasetEntry, DatasetIntegration } from "@/models"
import { type DatasetEntryJsonDataType } from "@/models/dataset-entry"

import BaseService from "@/services/base-service"

export class BulkReplaceDatasetEntriesService extends BaseService {
  constructor(private datasetIntegration: DatasetIntegration) {
    super()
  }

  async perform(): Promise<DatasetEntry[]> {
    const { datasetId, parsedJsonData } = this.datasetIntegration

    return db.transaction(async () => {
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
      return DatasetEntry.bulkCreate(datasetEntriesAttributes)
    })
  }
}
