import { isNil, isString } from "lodash"
import { CreationAttributes } from "sequelize"

import DatasetIntegration from "@/models/dataset-integration"
import DatasetEntry, { DatasetEntryJsonDataType } from "@/models/dataset-entry"

export async function bulkReplaceDatasetEntries(datasetIntegration: DatasetIntegration) {
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

export default bulkReplaceDatasetEntries
