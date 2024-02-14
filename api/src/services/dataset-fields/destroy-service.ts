import { DatasetField, User } from "@/models"

import BaseService from "@/services/base-service"

export class DestroyService extends BaseService {
  constructor(
    private datasetField: DatasetField,
    private currentUser: User
  ) {
    super()
  }

  async perform(): Promise<void> {
    await this.datasetField.destroy()

    // TODO: log user action

    return
  }
}

export default DestroyService
