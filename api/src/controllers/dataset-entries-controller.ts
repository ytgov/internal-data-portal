import { ModelStatic, WhereOptions } from "sequelize"
import { isEmpty } from "lodash"
import { createReadStream } from "fs"

import { DatasetEntry } from "@/models"
import { DatasetEntriesPolicy } from "@/policies"
import { CreateCsvService } from "@/services/dataset-entries"

import BaseController from "@/controllers/base-controller"

// TODO: consider moving this to a /datasets/:datasetId/entries route
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

  private async respondWithCsv(
    datasetEntriesScope: ModelStatic<DatasetEntry>,
    where: WhereOptions<DatasetEntry>
  ) {
    try {
      const filePath = await CreateCsvService.perform(datasetEntriesScope, where)

      this.response.header("Content-Type", "text/csv")
      const date = new Date().toISOString().split("T")[0]
      this.response.attachment(`Export, Dataset Entries, ${date}.csv`)

      const fileStream = createReadStream(filePath)
      fileStream.pipe(this.response)
    } catch (error) {
      console.error("Failed to generate CSV", error)
      this.response.status(500).send(`Failed to generate CSV: ${error}`)
    }
  }
}

export default DatasetEntriesController
