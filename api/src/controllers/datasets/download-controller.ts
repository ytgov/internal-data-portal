import { isEmpty, isNil } from "lodash"
import { WhereOptions } from "sequelize"
import { createReadStream } from "fs"

import { Dataset, DatasetEntry } from "@/models"
import { DatasetEntries } from "@/services"

import { BaseController } from "@/controllers/base-controller"
import { DatasetEntriesPolicy } from "@/policies"

export class DownloadController extends BaseController {
  async create() {
    try {
      const dataset = await this.loadDataset()
      if (isNil(dataset)) {
        return this.response.status(404).send("Dataset not found.")
      }

      const fileName = await this.buildFileName(dataset.name)
      this.response.header("Content-Type", "text/csv")
      this.response.attachment(fileName)

      const where = this.query.where as WhereOptions<DatasetEntry>
      const searchToken = this.query.searchToken as string
      const scopedDatasetEntries = DatasetEntriesPolicy.applyScope(DatasetEntry, this.currentUser)
      let filteredDatasetEntries = scopedDatasetEntries
      if (!isEmpty(searchToken)) {
        filteredDatasetEntries = scopedDatasetEntries.scope({ method: ["search", searchToken] })
      }

      const filePath = await DatasetEntries.CreateCsvService.perform(filteredDatasetEntries, where)

      const fileStream = createReadStream(filePath)
      fileStream.pipe(this.response)
    } catch (error) {
      console.error("Failed to generate CSV", error)
      this.response.status(500).send(`Failed to generate CSV: ${error}`)
    }
  }

  private async loadDataset(): Promise<Dataset | null> {
    const { datasetIdOrSlug } = this.request.params
    return Dataset.findBySlugOrPk(datasetIdOrSlug)
  }

  private async buildFileName(datasetName: string) {
    const date = new Date().toISOString().split("T")[0]
    return `Export, ${datasetName}, ${date}.csv`
  }
}

export default DownloadController
