import { isNil } from "lodash"

import { DatasetFile, User } from "@/models"

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

    const datasetFile = await DatasetFile.create({
      datasetId,
      name,
      data,
      sizeInBytes,
      mimeType,
      md5Hash,
    })

    return datasetFile
  }
}

export default CreateService
