import { isNil } from "lodash"
import { CreationAttributes } from "sequelize"

import db, { DatasetEntry, DatasetIntegration } from "@/models"

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
          return {
            datasetId,
            rawJsonData,
            // TODO: fix types, and pipeline, so this cast is not necessary
            jsonData: rawJsonData as Record<string, string | number>,
          }
        }
      )
      return DatasetEntry.bulkCreate(datasetEntriesAttributes)
    })
  }
}
