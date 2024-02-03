import { pick } from "lodash"

import { Dataset, User } from "@/models"
import { DetermineAccessSerializer } from "@/serializers/datasets/table"
import BaseSerializer from "@/serializers/base-serializer"

export type DatasetTableView = Partial<Dataset> & {
  access: string
  actions: string
}

export class TableSerializer extends BaseSerializer<Dataset> {
  constructor(
    protected record: Dataset,
    protected currentUser: User
  ) {
    super(record)
  }

  perform(): DatasetTableView {
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
      stewardshipEvolutions: this.record.stewardshipEvolutions,
      tags: this.record.tags,

      // magic fields
      access: this.determineAccess(),
      actions: this.determineActions(),
    }
  }

  private determineAccess() {
    return DetermineAccessSerializer.perform(this.record, this.currentUser)
  }

  // TODO: this will also have a lot of cases
  // I need tests for this so I'm doing it in a future PR.
  private determineActions(): string {
    return "TODO"
  }
}
