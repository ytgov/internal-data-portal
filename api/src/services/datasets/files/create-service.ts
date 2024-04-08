import { CreationAttributes } from "sequelize"
import { isNil, startCase } from "lodash"
import { parseString } from "fast-csv"

import { csvParseInBatches } from "@/utils/csv-parse-in-batches"
import db, { DatasetEntry, DatasetField, DatasetFile, User } from "@/models"
import { DatasetEntryJsonDataType } from "@/models/dataset-entry"

import BaseService from "@/services/base-service"

export class CreateService extends BaseService {
  constructor(
    private attributes: Partial<DatasetFile>,
    private currentUser: User
  ) {
    super()
  }

  async perform(): Promise<DatasetFile> {
    const { datasetId, name, data, sizeInBytes, mimeType, md5Hash } = this.attributes
    if (isNil(datasetId)) {
      throw new Error("Dataset ID is required.")
    }

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
      const datasetFile = await DatasetFile.create({
        datasetId,
        name,
        data,
        sizeInBytes,
        mimeType,
        md5Hash,
      })

      await this.bulkReplaceDatasetEntries(datasetId, data)

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
      async (headers: string[]) => {
        const datasetFieldsCount = await DatasetField.count({
          where: {
            datasetId,
          },
        })
        if (datasetFieldsCount > 0) {
          return
        }

        return this.bulkCreateDatasetFields(headers)
      },
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

  private async bulkCreateDatasetFields(headers: string[]): Promise<void> {
    const datasetFieldsAttributes: CreationAttributes<DatasetField>[] = headers.map((header) => {
      const displayName = startCase(header)

      return {
        datasetId: this.attributes.datasetId,
        name: header,
        displayName,
        dataType: DatasetField.DataTypes.TEXT,
      }
    })

    await DatasetField.bulkCreate(datasetFieldsAttributes)
  }
}

export default CreateService
