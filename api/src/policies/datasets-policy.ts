import { Dataset, User } from "@/models"
import { RoleTypes } from "@/models/role"

import { Path } from "@/utils/deep-pick"
import BasePolicy from "@/policies/base-policy"

export class DatasetsPolicy extends BasePolicy<Dataset> {
  constructor(user: User, record: Dataset) {
    super(user, record)
  }

  show(): boolean {
    if (this.isSystemAdmin || this.isBusinessAnalyst) {
      return true
    } else if (this.isDataOwner && this.record.ownerId === this.user.id) {
      return true
    }

    return false
  }

  create(): boolean {
    if (this.isSystemAdmin || this.isBusinessAnalyst) {
      return true
    } else if (this.isDataOwner && this.record.ownerId === this.user.id) {
      return true
    }

    return false
  }

  update(): boolean {
    if (this.isSystemAdmin || this.isBusinessAnalyst) {
      return true
    } else if (this.isDataOwner && this.record.ownerId === this.user.id) {
      return true
    }

    return false
  }

  permittedAttributes(): Path[] {
    return [
      ...(this.isSystemAdmin || this.isBusinessAnalyst ? ["ownerId"] : []),
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

      // stateful attributes - maybe should require a stateful controller endpoint to update?
      "deactivatedAt",
      "publishedAt",
    ]
  }

  permittedAttributesForCreate(): Path[] {
    return [
      ...this.permittedAttributes(),
      {
        stewardshipAttributes: [
          "ownerId",
          "supportId",
          "departmentId",
          "divisionId",
          "branchId",
          "unitId",
        ],
      },
    ]
  }

  private get isSystemAdmin(): boolean {
    return this.user.roleTypes.includes(RoleTypes.SYSTEM_ADMIN)
  }

  private get isBusinessAnalyst(): boolean {
    return this.user.roleTypes.includes(RoleTypes.BUSINESS_ANALYST)
  }

  private get isDataOwner(): boolean {
    return this.user.roleTypes.includes(RoleTypes.DATA_OWNER)
  }
}

export default DatasetsPolicy
