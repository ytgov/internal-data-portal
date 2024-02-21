import { pick } from "lodash"

import { AccessGrant, AccessRequest, Dataset, User } from "@/models"
import BaseSerializer from "@/serializers/base-serializer"

export type DatasetShowView = Partial<Dataset> & {
  currentUserAccessGrant: AccessGrant | null
  currentUserAccessRequest: AccessRequest | null
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
    const currentUserAccessGrant = this.record.mostPermissiveAccessGrantFor(this.currentUser)
    const currentUserAccessRequest = this.record.accessRequests?.filter(
      (accessRequest) => accessRequest.requestorId == this.currentUser.id
    )[0] || null

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
      currentUserAccessGrant,
      currentUserAccessRequest,
    }
  }

  // Duplicating the policy logic here as the policy code does not have the same
  // conceptual purpose, even though the current implementation is identical.
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
