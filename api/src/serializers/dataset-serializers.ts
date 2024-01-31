import { pick } from "lodash"

import { AccessGrant, Dataset, User } from "@/models"

import BaseSerializer from "@/serializers/base-serializer"

export type DatasetTableView = Partial<Dataset> & {
  access: string
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

  private determineAccess(): string {
    if (this.currentUser === undefined) {
      throw new Error("currentUser is required to determine access")
    }

    for (const accessType of Object.values(AccessGrant.AccessTypes)) {
      for (const grantLevel of Object.values(AccessGrant.GrantLevels)) {
        const accessGrant = this.record.accessGrants?.find(
          (accessGrant) =>
            accessGrant.accessType === accessType && accessGrant.grantLevel === grantLevel
        )
        if (accessGrant) {
          return accessGrant.accessType
        }
      }
    }

    return "no_access"
  }
}

export default DatasetSerializers
