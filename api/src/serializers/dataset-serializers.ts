import { pick } from "lodash"

import { AccessGrant, Dataset, User } from "@/models"
import { GrantLevels, AccessTypes } from "@/models/access-grant"

import BaseSerializer from "@/serializers/base-serializer"

export type DatasetTableView = Partial<Dataset> & {
  access: string
  actions: string
}
export type DatasetDetailedView = Partial<Dataset>

export class DatasetSerializers extends BaseSerializer<Dataset> {
  static asTable(datasets: Dataset[], currentUser: User): DatasetTableView[] {
    return datasets.map((dataset) => {
      const serializer = new this(dataset, currentUser)
      return serializer.asTable()
    })
  }

  static asDetailed(dataset: Dataset): DatasetDetailedView {
    const serializer = new this(dataset)
    return serializer.asDetailed()
  }

  private currentUser: User | undefined

  constructor(record: Dataset, currentUser?: User) {
    super(record)
    this.currentUser = currentUser
  }

  asTable(): DatasetTableView {
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
      stewardshipEvolutions: this.record.stewardshipEvolutions,
      tags: this.record.tags,
    }
  }

  // TODO: handle enormous number of cases
  // I need tests for this so I'm doing it in a future PR.
  private determineAccess(): AccessTypes {
    return 'TODO' as any
  }

  // TODO: this will also have a lot of cases
  // I need tests for this so I'm doing it in a future PR.
  private determineActions(): string {
    return 'TODO'
  }
}

export default DatasetSerializers
