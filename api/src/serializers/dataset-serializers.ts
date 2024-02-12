import { pick } from "lodash"

import { Dataset } from "@/models"

import BaseSerializer from "@/serializers/base-serializer"

export type DatasetDetailedView = Partial<Dataset>

export class DatasetSerializers extends BaseSerializer<Dataset> {
  static asDetailed(dataset: Dataset): DatasetDetailedView {
    const serializer = new this(dataset)
    return serializer.asDetailed()
  }

  asDetailed(): DatasetDetailedView {
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
        "isSpatialData",
        "isLiveData",
        "termsOfUse",
        "credits",
        "ownerNotes",
        "status",
        "errorCode",
        "errorDetails",
        "publishedAt",
        "deactivatedAt",
        "createdAt",
        "updatedAt",
      ]),
      owner: this.record.owner,
      creator: this.record.creator,
      stewardship: this.record.stewardship,
      tags: this.record.tags,
    }
  }
}

export default DatasetSerializers
