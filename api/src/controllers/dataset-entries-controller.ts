import { ModelStatic, WhereOptions } from "sequelize"
import { isEmpty } from "lodash"
import Papa from "papaparse"

import { Dataset, DatasetEntry, DatasetField } from "@/models"
import { DatasetEntriesPolicy } from "@/policies"

import BaseController from "@/controllers/base-controller"

// TODO: consider moving this to a /dataset/:datasetId/entries route
// so that we can use the datasetId to scope the entries and reduce query complexity
export class DatasetEntriesController extends BaseController {
  async index() {
    const where = this.query.where as WhereOptions<DatasetEntry>
    const searchToken = this.query.searchToken as string

    const scopedDatasetEntries = DatasetEntriesPolicy.applyScope(DatasetEntry, this.currentUser)

    let filteredDatasetEntries = scopedDatasetEntries
    if (!isEmpty(searchToken)) {
      filteredDatasetEntries = scopedDatasetEntries.scope({ method: ["search", searchToken] })
    }

    if (this.format === "csv") {
      return this.respondWithCsv(filteredDatasetEntries, where)
    } else {
      const totalCount = await filteredDatasetEntries.count({ where })
      const datasetEntries = await filteredDatasetEntries.findAll({
        where,
        limit: this.pagination.limit,
        offset: this.pagination.offset,
      })

      return this.response.json({ datasetEntries, totalCount })
    }
  }

  // TODO: move this to a service
  private async respondWithCsv(
    datasetEntriesScope: ModelStatic<DatasetEntry>,
    where: WhereOptions<DatasetEntry>
  ) {
    this.response.header("Content-Type", "text/csv")
    const date = new Date().toISOString().split("T")[0]
    this.response.attachment(`Data, Dataset Entries, ${date}.csv`)

    try {
      let isFirstLine = true
      // @ts-expect-error - findEach works, but I can't figure out how to type it correctly
      await datasetEntriesScope.findEach(
        {
          where,
          include: [
            {
              association: "dataset",
              include: ["fields"],
            },
          ],
        },
        (datasetEntry: DatasetEntry) => {
          const { jsonData, dataset } = datasetEntry
          const { fields } = dataset as Omit<Dataset, "fields"> & { fields: DatasetField[] }
          const headers = fields.map((field) => field.displayName)

          if (isFirstLine) {
            const rowString = Papa.unparse([headers])
            this.response.write(rowString)
            this.response.write("\r\n")
          }

          const preparedData = fields?.map((field) => jsonData[field.name])
          const rowString = Papa.unparse([preparedData])
          this.response.write(rowString)
          this.response.write("\r\n")

          isFirstLine = false
        }
      )
    } catch (error) {
      console.error("Failed to generate CSV", error)
      this.response.write(`Failed to generate CSV: ${error}`)
    } finally {
      this.response.end()
    }
  }
}

export default DatasetEntriesController
