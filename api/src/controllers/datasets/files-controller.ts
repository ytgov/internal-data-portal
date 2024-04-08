import { isArray, isEmpty, isNil, omit } from "lodash"

import { Dataset, DatasetFile } from "@/models"
import { DatasetsPolicy } from "@/policies"

import BaseController from "@/controllers/base-controller"

export class FilesController extends BaseController {
  async create() {
    const dataset = await this.loadDataset()
    if (isNil(dataset)) {
      return this.response.status(404).json({ message: "Dataset not found." })
    }

    const policy = this.buildPolicy(dataset)
    if (!policy.update()) {
      return this.response
        .status(403)
        .json({ message: "You are not authorized to upload files to this dataset." })
    }

    if (
      isNil(this.request.files) ||
      isEmpty(this.request.files) ||
      isNil(this.request.files.file)
    ) {
      return this.response.status(400).send("No files were uploaded.")
    } else if (isArray(this.request.files.file)) {
      return this.response.status(422).send("Only one file can be uploaded at a time.")
    } else if (this.request.files.file.truncated) {
      return this.response.status(413).send("The file is too large.")
    }

    try {
      const { name, data, size, mimetype, md5 } = this.request.files.file

      const datasetFile = await DatasetFile.create({
        datasetId: dataset.id,
        name,
        data,
        sizeInBytes: size,
        mimeType: mimetype,
        md5Hash: md5,
      })

      return this.response.json({
        datasetFile: omit(datasetFile, "data"),
        message: "Dataset file uploaded successfully.",
      })
    } catch (error) {
      console.error(`Dataset file upload failed: ${error}`)
      return this.response.status(500).json({ message: `Dataset file upload failed: ${error}` })
    }
  }

  private async loadDataset(): Promise<Dataset | null> {
    const { datasetIdOrSlug } = this.request.params
    return Dataset.findBySlugOrPk(datasetIdOrSlug)
  }

  private buildPolicy(dataset: Dataset) {
    return new DatasetsPolicy(this.currentUser, dataset)
  }
}

export default FilesController
