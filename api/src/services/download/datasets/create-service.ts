import { CsvFormatterStream } from "fast-csv"
import { isEmpty, isUndefined } from "lodash"

import { Dataset, User } from "@/models"
import CreateFromIntegrationService from "@/services/download/datasets/create-from-integration-service"
import CreateFromFileService from "@/services/download/datasets/create-from-file-service"

import BaseService from "@/services/base-service"

export class CreateService extends BaseService {
  constructor(
    private csvStream: CsvFormatterStream<string[], string[]>,
    private dataset: Dataset,
    private currentUser: User,
    private options: {
      searchToken?: string
    }
  ) {
    super()
  }

  async perform(): Promise<void> {
    const { integration, file, fields } = this.dataset

    if (isUndefined(fields)) {
      throw new Error("Dataset is missing fields association")
    }

    if (!isEmpty(integration)) {
      return CreateFromIntegrationService.perform(
        this.csvStream,
        integration,
        fields,
        this.currentUser,
        this.options
      )
    } else if (!isEmpty(file)) {
      return CreateFromFileService.perform(
        this.csvStream,
        file,
        fields,
        this.currentUser,
        this.options
      )
    } else {
      throw new Error("Dataset must have an integration or file association to download.")
    }

    return
  }
}

export default CreateService
