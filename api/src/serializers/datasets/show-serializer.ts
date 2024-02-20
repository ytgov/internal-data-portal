import { isNil, pick } from "lodash"

import { Dataset, User } from "@/models"
import { AccessTypes } from "@/models/access-grant"
import BaseSerializer from "@/serializers/base-serializer"

export type DatasetShowView = Partial<Dataset> & {
  currentUserAccessType: AccessTypes
}

export class ShowSerializer extends BaseSerializer<Dataset> {
  constructor(
    protected record: Dataset,
    protected currentUser: User
  ) {
    super(record)
  }

  perform(): DatasetShowView {
    if (this.hasFullAccess()) {
      return this.baseView({
        ...pick(this.record.dataValues, [
          "creatorId",
          "subscriptionUrl",
          "subscriptionAccessCode",
          "isSubscribable",
          "publishedAt",
          "deactivatedAt",
          "status",
          "errorCode",
          "errorDetails",
          "ownerNotes",
        ]),
        creator: this.record.creator,
      })
    }

    // TODO: might need to include subscriptionUrl in the future
    // or in a "limited access" view

    return this.baseView()
  }

  private baseView(extraAttributes: Partial<Dataset> = {}): DatasetShowView {
    const currentUserAccessType = this.determineAccess()

    return {
      ...pick(this.record.dataValues, [
        "id",
        "ownerId",
        "slug",
        "name",
        "description",
        "isSpatialData",
        "isLiveData",
        "termsOfUse",
        "credits",
        "createdAt",
        "updatedAt",
      ]),
      ...extraAttributes,
      owner: this.record.owner,
      stewardship: this.record.stewardship,
      tags: this.record.tags,

      // magic fields
      currentUserAccessType,
    }
  }

  private determineAccess() {
    const accessGrant = this.record.mostPermissiveAccessGrantFor(this.currentUser)
    if (!isNil(accessGrant)) {
      return accessGrant.accessType
    }

    return AccessTypes.NO_ACCESS
  }

  // Duplicating the policy logic here as the policy code does not have the same
  // conceptual purpose, even though the current implementation is idential.
  private hasFullAccess(): boolean {
    if (this.currentUser.isSystemAdmin || this.currentUser.isBusinessAnalyst) {
      return true
    } else if (this.currentUser.isDataOwner && this.record.ownerId === this.currentUser.id) {
      return true
    }

    return false
  }
}

export default ShowSerializer
