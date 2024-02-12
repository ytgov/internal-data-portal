import { DatasetStewardship, User } from "@/models"
import { RoleTypes } from "@/models/role"

import { Path } from "@/utils/deep-pick"
import BasePolicy from "@/policies/base-policy"

export class DatasetStewardshipsPolicy extends BasePolicy<DatasetStewardship> {
  constructor(user: User, record: DatasetStewardship) {
    super(user, record)
  }

  // TODO: Consider if this should simply do DatasetPolicy.show()?
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
      "supportId",
      "departmentId",
      "divisionId",
      "branchId",
      "unitId",
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

export default DatasetStewardshipsPolicy
