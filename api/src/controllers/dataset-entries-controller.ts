import { ModelStatic, WhereOptions } from "sequelize"
import { isEmpty, isNil } from "lodash"
import { createReadStream } from "fs"

import { Dataset, DatasetEntry } from "@/models"
import { DatasetEntriesPolicy } from "@/policies"
import { BaseScopeOptions } from "@/policies/base-policy"
import { CreateCsvService } from "@/services/dataset-entries"

import BaseController from "@/controllers/base-controller"

// TODO: consider moving this to a /datasets/:datasetId/entries route
// so that we can use the datasetId to scope the entries and reduce query complexity
export class DatasetEntriesController extends BaseController {
  async index() {
    const where = this.query.where as WhereOptions<DatasetEntry>
    const filters = this.query.filters as Record<string, unknown>

    const scopes: BaseScopeOptions[] = []
    if (!isEmpty(filters)) {
      Object.entries(filters).forEach(([key, value]) => {
        scopes.push({ method: [key, value] })
      })
    }
    const scopedDatasetEntries = DatasetEntriesPolicy.applyScope(scopes, this.currentUser)

    if (this.format === "csv") {
      return this.respondWithCsv(scopedDatasetEntries, where)
    } else {
      const totalCount = await scopedDatasetEntries.count({ where })
      const datasetEntries = await scopedDatasetEntries.findAll({
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
      const fileName = await this.buildFileName()
      const filePath = await CreateCsvService.perform(datasetEntriesScope, where)

      this.response.header("Content-Type", "text/csv")
      this.response.attachment(fileName)

      const fileStream = createReadStream(filePath)
      fileStream.pipe(this.response)
    } catch (error) {
      console.error("Failed to generate CSV", error)
      this.response.status(500).send(`Failed to generate CSV: ${error}`)
    }
  }

  private async buildFileName() {
    const { datasetId } = this.query.where as unknown as { datasetId: number }

    const date = new Date().toISOString().split("T")[0]
    const genericFileName = `Export, Dataset Entries, ${date}.csv`
    if (isNil(datasetId)) {
      return genericFileName
    }

    const datasets = await Dataset.findAll({ where: { id: datasetId } })
    const names = datasets.map((dataset) => dataset.name).join("-")

    if (isEmpty(names)) {
      return genericFileName
    }

    return `Export, ${names}, ${date}.csv`
  }
}

export default DatasetEntriesController
