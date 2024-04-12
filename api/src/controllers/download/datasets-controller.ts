import { isNil } from "lodash"
import { format } from "fast-csv"

import { Dataset } from "@/models"
import { DatasetsPolicy } from "@/policies"
import { CreateService } from "@/services/download/datasets"

import { BaseController } from "@/controllers/base-controller"

export class DatasetsController extends BaseController {
  async create() {
    const dataset = await this.loadDataset()
    if (isNil(dataset)) {
      return this.response.status(404).send("Dataset not found.")
    }

    const policy = this.buildPolicy(dataset)
    if (!policy.show({ unlimited: true })) {
      return this.response.status(403).send("You are not allowed to download this dataset.")
    }

    const searchToken = this.query.searchToken as string

    const fileName = await this.buildFileName(dataset.name)
    this.response.status(201)
    this.response.header("Content-Type", "text/csv")
    this.response.attachment(fileName)
    const csvStream = format({ headers: false })
    csvStream.pipe(this.response)

    try {
      await CreateService.perform(csvStream, dataset, this.currentUser, { searchToken })
    } catch (error) {
      console.error(`Failed to generate CSV: ${error}`)
      this.response.write(`\n\nFailed to generate CSV due to server error.`)
      this.response.write(`\nError: ${error}\n`)
      this.response.end()
    } finally {
      csvStream.end()
    }
  }

  private async buildFileName(datasetName: string) {
    const date = new Date().toISOString().split("T")[0]
    return `Export, ${datasetName}, ${date}.csv`
  }

  private buildPolicy(dataset: Dataset) {
    return new DatasetsPolicy(this.currentUser, dataset)
  }

  private async loadDataset(): Promise<Dataset | null> {
    const { datasetIdOrSlug } = this.request.params
    return Dataset.findBySlugOrPk(datasetIdOrSlug, {
      include: [
        // for data rendering logic
        "file",
        "integration",
        {
          association: "fields",
          where: { isExcludedFromSearch: false },
        },
        // for policy logic
        {
          association: "owner",
          include: ["groupMembership"],
        },
        "accessGrants",
        "accessRequests",
      ],
    })
  }
}

export default DatasetsController
