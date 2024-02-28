import { isNil } from "lodash"

import { GrantLevels } from "@/models/access-grant"
import UserGroupMembership from "@/models/user-group-membership"

export function matchesGrantLevel(
  grantLevel: GrantLevels,
  ownerGroupMembership: UserGroupMembership,
  requestingUserGroupMembership: UserGroupMembership
): boolean {
  if (grantLevel === GrantLevels.GOVERNMENT_WIDE) {
    return true
  } else if (
    grantLevel === GrantLevels.DEPARTMENT &&
    !isNil(ownerGroupMembership.departmentId) &&
    ownerGroupMembership.departmentId === requestingUserGroupMembership.departmentId
  ) {
    return true
  } else if (
    grantLevel === GrantLevels.DIVISION &&
    !isNil(ownerGroupMembership.departmentId) &&
    !isNil(ownerGroupMembership.divisionId) &&
    ownerGroupMembership.departmentId === requestingUserGroupMembership.departmentId &&
    ownerGroupMembership.divisionId === requestingUserGroupMembership.divisionId
  ) {
    return true
  } else if (
    grantLevel === GrantLevels.BRANCH &&
    !isNil(ownerGroupMembership.departmentId) &&
    !isNil(ownerGroupMembership.divisionId) &&
    !isNil(ownerGroupMembership.branchId) &&
    ownerGroupMembership.departmentId === requestingUserGroupMembership.departmentId &&
    ownerGroupMembership.divisionId === requestingUserGroupMembership.divisionId &&
    ownerGroupMembership.branchId === requestingUserGroupMembership.branchId
  ) {
    return true
  } else if (
    grantLevel === GrantLevels.UNIT &&
    !isNil(ownerGroupMembership.divisionId) &&
    !isNil(ownerGroupMembership.departmentId) &&
    !isNil(ownerGroupMembership.branchId) &&
    !isNil(ownerGroupMembership.unitId) &&
    ownerGroupMembership.departmentId === requestingUserGroupMembership.departmentId &&
    ownerGroupMembership.divisionId === requestingUserGroupMembership.divisionId &&
    ownerGroupMembership.branchId === requestingUserGroupMembership.branchId &&
    ownerGroupMembership.unitId === requestingUserGroupMembership.unitId
  ) {
    return true
  } else {
    return false
  }
}
