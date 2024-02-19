import { pick } from "lodash"

import { Dataset, User } from "@/models"
import { AccessTypes } from "@/models/access-grant"
import {
  determineAccess,
  determineActions,
  type DatasetTableActions,
} from "@/serializers/datasets/table-helpers"
import BaseSerializer from "@/serializers/base-serializer"

export type DatasetTableView = Partial<Dataset> & {
  access: string
  actions: DatasetTableActions | void
}

export class TableSerializer extends BaseSerializer<Dataset> {
  constructor(
    protected record: Dataset,
    protected currentUser: User
  ) {
    super(record)
  }

  perform(): DatasetTableView {
    const accessTypes = this.determineAccess()
    return {
      ...pick(this.record.dataValues, [
        "id",
        "ownerId",
        "creatorId",
        "slug",
        "name",
        "description",
        "subscriptionUrl",
        "subscriptionAccessCode",
        "isSubscribable",
        "status",
        "publishedAt",
        "deactivatedAt",
        "createdAt",
        "updatedAt",
      ]),
      owner: this.record.owner,
      creator: this.record.creator,
      stewardship: this.record.stewardship,
      tags: this.record.tags,

      // magic fields
      access: accessTypes,
      actions: this.determineActions(accessTypes),
    }
  }

  private determineAccess() {
    return determineAccess(this.record, this.currentUser)
  }

  private determineActions(accessType: AccessTypes) {
    return determineActions(this.record, this.currentUser, accessType)
  }
}

export default TableSerializer
