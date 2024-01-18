import { Dataset, User } from "@/models"

import BasePolicy from "@/policies/base-policy"
import { RoleTypes } from "@/models/role"

export class DatasetsPolicy extends BasePolicy<Dataset> {
  constructor(user: User, record: Dataset) {
    super(user, record)
  }

  create(): boolean {
    if (
      this.user.roleTypes.includes(RoleTypes.SYSTEM_ADMIN) ||
      this.user.roleTypes.includes(RoleTypes.BUSINESS_ANALYST)
    ) {
      return true
    } else if (
      this.user.roleTypes.includes(RoleTypes.DATA_OWNER) &&
      this.record.ownerId === this.user.id
    ) {
      return true
    }

    return false
  }

  permittedAttributes(): string[] {
    // TODO: include owner id for SYSTEM_ADMIN and BUSINESS_ANALYST
    return [
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
      // TODO: include nested attributes for StewardshipEvolutions
    ]
  }

  permittedAttributesForCreate(): string[] {
    return ["ownerId", ...this.permittedAttributes()]
  }
}

export default DatasetsPolicy
