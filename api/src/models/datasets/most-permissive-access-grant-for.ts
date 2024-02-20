import { isEmpty, isNil } from "lodash"

import { Dataset, User, AccessGrant, UserGroupMembership } from "@/models"
import { AccessTypes, GrantLevels, orderOfAccessType } from "@/models/access-grant"

export function mostPermissiveAccessGrantFor(
  record: Dataset,
  requestingUser: User
): AccessGrant | null {
  const { accessGrants, owner } = record

  if (isNil(accessGrants) || isEmpty(accessGrants) || isNil(owner)) {
    return null
  }

  const { groupMembership: ownerGroupMembership } = owner
  const { groupMembership: requestingUserGroupMembership } = requestingUser
  if (isNil(ownerGroupMembership) || isNil(requestingUserGroupMembership)) {
    return null
  }

  return accessGrants.reduce<AccessGrant | null>(
    (currentAccess: AccessGrant | null, newAccessGrant: AccessGrant) => {
      const currentAccessType = currentAccess?.accessType || AccessTypes.NO_ACCESS
      const { accessType: newAccessType } = newAccessGrant
      if (orderOfAccessType(currentAccessType) > orderOfAccessType(newAccessType)) {
        return currentAccess
      }

      const { grantLevel: newGrantLevel } = newAccessGrant
      if (matchesGrantLevel(newGrantLevel, ownerGroupMembership, requestingUserGroupMembership)) {
        return newAccessGrant
      }

      return currentAccess
    },
    null
  )
}

function matchesGrantLevel(
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

export default mostPermissiveAccessGrantFor
