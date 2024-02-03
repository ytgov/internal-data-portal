import { Dataset, User } from "@/models"
import { AccessTypes } from "@/models/access-grant"

import BaseSerializer from "@/serializers/base-serializer"

export class DetermineAccessSerializer extends BaseSerializer<Dataset> {
  private currentUser: User

  constructor(record: Dataset, currentUser: User) {
    super(record)
    this.currentUser = currentUser
  }

  perform(): AccessTypes {
    return 'TODO' as any
  }
}

export default DetermineAccessSerializer
