import { CsvFormatterStream, parseString } from "fast-csv"
import { isEmpty, isNil, some } from "lodash"

import { DatasetField, DatasetFile, User } from "@/models"

import BaseService from "@/services/base-service"

type Row = Record<string, unknown>

export class CreateFromFileService extends BaseService {
  constructor(
    private csvOutputStream: CsvFormatterStream<string[], string[]>,
    private datasetFile: DatasetFile,
    private datasetFields: DatasetField[],
    private currentUser: User,
    private options: {
      searchToken?: string
    }
  ) {
    super()
  }

  async perform(): Promise<void> {
    const headers = this.datasetFields.map((field) => field.displayName)
    const headerKeys = this.datasetFields.map((field) => field.name)
    this.csvOutputStream.write(headers)

    const { data } = this.datasetFile

    const inputStream = parseString(data.toString("utf8"), { headers: true })

    return new Promise((resolve, reject) => {
      let hasSanityCheckedData = false
      inputStream.on("data", (row: Row) => {
        if (hasSanityCheckedData === false) {
          this.sanityCheckData(row, headerKeys)
          hasSanityCheckedData = true
        }

        const searchToken = this.options.searchToken
        if (!isNil(searchToken) && !isEmpty(searchToken)) {
          const rowHasMatch = some(row, (value) => this.matchesSearch(value, searchToken))
          if (rowHasMatch === false) {
            return
          }
        }

        const dataFromFields = headerKeys.map((field) => row[field])
        this.csvOutputStream.write(dataFromFields)
      })

      inputStream.on("end", resolve)
      inputStream.on("error", reject)
    })
  }

  /**
   * Should match logic in api/src/models/dataset-entries/dataset-entries-search.ts
   */
  private matchesSearch(value: unknown, searchToken: string) {
    switch (typeof value) {
      case "string":
        return value.toLowerCase().includes(searchToken.toLowerCase())
      case "number":
        return value.toString() === searchToken.toLowerCase()
      default:
        return false
    }
  }

  private sanityCheckData(row: Row, headerKeys: string[]): void {
    if (headerKeys.length === 0) {
      throw new Error("Header keys array is empty")
    }

    const rowKeys = Object.keys(row)
    const allKeysPresent = headerKeys.every((key) => rowKeys.includes(key))
    if (allKeysPresent === false) {
      throw new Error("There is a mismatch between header keys and data keys.")
    }
  }
}

export default CreateFromFileService
