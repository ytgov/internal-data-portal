import { CreationAttributes } from "sequelize"
import { isNil } from "lodash"
import { parseString } from "fast-csv"

import { csvParseInBatches } from "@/utils/csv-parse-in-batches"
import db, { DatasetEntry, DatasetFile, User } from "@/models"
import { DatasetEntryJsonDataType } from "@/models/dataset-entry"

import BaseService from "@/services/base-service"

export class UpdateService extends BaseService {
  constructor(
    private datasetFile: DatasetFile,
    private attributes: Partial<DatasetFile>,
    private currentUser: User
  ) {
    super()
  }

  async perform(): Promise<DatasetFile> {
    const { name, data, sizeInBytes, mimeType, md5Hash } = this.attributes
    if (isNil(name)) {
      throw new Error("Name is required.")
    }

    if (isNil(data)) {
      throw new Error("Data is required.")
    }

    if (isNil(sizeInBytes)) {
      throw new Error("Size in bytes is required.")
    }

    if (isNil(mimeType)) {
      throw new Error("MIME type is required.")
    }

    if (isNil(md5Hash)) {
      throw new Error("MD5 hash is required.")
    }

    return db.transaction(async () => {
      const datasetFile = await this.datasetFile.update({
        name,
        data,
        sizeInBytes,
        mimeType,
        md5Hash,
      })

      await this.bulkReplaceDatasetEntries(this.datasetFile.datasetId, data)

      return datasetFile
    })
  }

  private async bulkReplaceDatasetEntries(datasetId: number, data: Buffer): Promise<void> {
    await DatasetEntry.destroy({
      where: {
        datasetId,
      },
    })

    const stream = parseString(data.toString("utf8"), { headers: true })
    return csvParseInBatches(
      stream,
      async () => void 0,
      async (batch) => {
        const datasetEntriesAttributes: CreationAttributes<DatasetEntry>[] = batch.map((entry) => {
          return {
            datasetId,
            rawJsonData: entry,
            // TODO: reflect on what would be required to remove this
            // Maybe I should have a per-row parser as well?
            jsonData: entry as DatasetEntryJsonDataType,
          }
        })
        return DatasetEntry.bulkCreate(datasetEntriesAttributes)
      }
    )
  }
}

export default UpdateService
