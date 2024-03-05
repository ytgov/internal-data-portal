import { WhereOptions } from "sequelize"
import { isEmpty } from "lodash"

import { DatasetEntry } from "@/models"
import { DatasetEntriesPolicy } from "@/policies"

import BaseController from "@/controllers/base-controller"

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
      // Assuming pagination is removed for un-paginated results
      // const datasetEntries = await filteredDatasetEntries.findAll({ where })

      // Convert dataset entries to CSV using Papa Parse
      // const csv = Papa.unparse(datasetEntries)

      // // Set headers to indicate a file download
      // res.header("Content-Type", "text/csv")
      // res.attachment("dataset-entries.csv")

      // // Convert CSV string to stream and pipe it to response
      // const csvStream = Readable.from(csv)
      // csvStream.pipe(res)

      const csvContent = "Column1,Column2\nValue1,Value2"
      this.response.setHeader("Content-Type", "text/csv")
      this.response.setHeader("Content-Disposition", 'attachment; filename="download.csv"')
      this.response.send(csvContent)
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
}

export default DatasetEntriesController
