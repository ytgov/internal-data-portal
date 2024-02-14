import { DatasetField, User } from "@/models"

import BaseService from "@/services/base-service"

type Attributes = Partial<DatasetField>

export class UpdateService extends BaseService {
  constructor(
    private datasetField: DatasetField,
    private attributes: Attributes,
    private currentUser: User
  ) {
    super()
  }

  async perform(): Promise<DatasetField> {
    await this.datasetField.update(this.attributes)

    // TODO: log user action

    return this.datasetField
  }
}

export default UpdateService
