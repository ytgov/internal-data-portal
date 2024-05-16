import { isEmpty, isNil, isNumber, startCase } from "lodash"
import { CreationAttributes } from "sequelize"

import db, { DatasetField, DatasetIntegration } from "@/models"
import { DatasetFieldDataTypes } from "@/models/dataset-field"
import BaseService from "@/services/base-service"

export class BulkReplaceDatasetFieldsService extends BaseService {
  constructor(private datasetIntegration: DatasetIntegration) {
    super()
  }

  async perform(): Promise<DatasetField[]> {
    const { datasetId, parsedJsonData } = this.datasetIntegration

    return db.transaction(async () => {
      await DatasetField.destroy({
        where: {
          datasetId,
        },
      })

      if (isNil(parsedJsonData) || isEmpty(parsedJsonData)) {
        throw new Error("An integration must have data to build dataset fields.")
      }

      const firstRecord = parsedJsonData[0]
      const datasetFieldsAttributes: CreationAttributes<DatasetField>[] = Object.entries(
        firstRecord
      ).map(([key, value]) => {
        const displayName = startCase(key)
        const dataType = this.determineDataType(value)
        return {
          datasetId,
          name: key,
          displayName,
          dataType,
        }
      })
      return DatasetField.bulkCreate(datasetFieldsAttributes)
    })
  }

  private determineDataType(value: unknown): DatasetFieldDataTypes {
    if (isNumber(value)) {
      return DatasetField.DataTypes.INTEGER
    }

    return DatasetField.DataTypes.TEXT
  }
}

export default BulkReplaceDatasetFieldsService
