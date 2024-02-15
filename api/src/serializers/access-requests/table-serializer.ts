import { pick } from "lodash"

import { AccessRequest, User } from "@/models"
import BaseSerializer from "@/serializers/base-serializer"

export type AccessRequestTableView = Partial<AccessRequest>

export class TableSerializer extends BaseSerializer<AccessRequest> {
  constructor(
    protected record: AccessRequest,
    protected currentUser: User
  ) {
    super(record)
  }

  perform(): AccessRequestTableView {
    return {
      ...pick(this.record.dataValues, ["id", "createdAt", "updatedAt"]),
    }
  }
}
