import { createHash } from "crypto"
import { createWriteStream, mkdtempSync } from "fs"
import { join } from "path"
import { tmpdir } from "os"

import { ModelStatic, WhereOptions } from "sequelize"
import { isEmpty } from "lodash"
import Papa from "papaparse"

import { Dataset, DatasetEntry, DatasetField } from "@/models"
import BaseService from "@/services/base-service"

export class CreateCsvService extends BaseService {
  private tempDir: string
  private tempFilePath: string

  constructor(
    private datasetEntriesScope: ModelStatic<DatasetEntry>,
    private where: WhereOptions<DatasetEntry>
  ) {
    super()
    // Create a temporary directory for this instance
    this.tempDir = mkdtempSync(join(tmpdir(), "dataset-entries-csv-"))
    const date = Date.now()
    this.tempFilePath = join(this.tempDir, `Export, Dataset Entries, ${date}.csv`)
  }

  async perform(): Promise<string> {
    try {
      const fileStream = createWriteStream(this.tempFilePath)

      let previousHash = ""
      // @ts-expect-error - findEach works, but I can't figure out how to type it correctly
      await this.datasetEntriesScope.findEach(
        {
          where: this.where,
          include: [
            {
              association: "dataset",
              include: ["fields"],
            },
          ],
        },
        async (
          datasetEntry: DatasetEntry & {
            dataset: Dataset & { fields: DatasetField[] }
          }
        ) => {
          const { jsonData, dataset } = datasetEntry
          const { fields } = dataset
          const headers = fields.map((field) => field.displayName)

          const currentHash = this.hashHeaders(headers)

          if (currentHash !== previousHash) {
            if (!isEmpty(previousHash)) {
              fileStream.write("\r\n")
            }

            const rowString = Papa.unparse([headers])
            fileStream.write(rowString)
            fileStream.write("\r\n")
            previousHash = currentHash
          }

          const preparedData = fields?.map((field) => jsonData[field.name])
          const rowString = Papa.unparse([preparedData])
          fileStream.write(rowString)
          fileStream.write("\r\n")
        }
      )

      await new Promise((resolve, reject) => {
        fileStream.on("error", reject)
        fileStream.end(resolve)
      })

      return this.tempFilePath
    } catch (error) {
      console.error("Failed to generate CSV", error)
      throw new Error(`Failed to generate CSV: ${error}`)
    }
  }

  private hashHeaders(headers: string[]): string {
    const stringifiedHeaders = JSON.stringify(headers)
    return createHash("sha1").update(stringifiedHeaders).digest("base64")
  }
}

export default CreateCsvService
