import { isEmpty, isNil } from "lodash"

import { Dataset, User, AccessGrant, UserGroupMembership } from "@/models"
import { AccessTypes, GrantLevels, orderOfAccessType } from "@/models/access-grant"

export function determineAccess(record: Dataset, requestingUser: User): AccessTypes {
  const { accessGrants, owner } = record

  if (isNil(accessGrants) || isEmpty(accessGrants) || isNil(owner)) {
    return AccessTypes.NO_ACCESS
  }

  return accessGrants.reduce<AccessTypes>(
    (currentAccess: AccessTypes, accessGrant: AccessGrant) => {
      const { accessType } = accessGrant
      if (orderOfAccessType(currentAccess) > orderOfAccessType(accessType)) {
        return currentAccess
      }

      const { grantLevel } = accessGrant
      const { groupMembership: ownerGroupMembership } = owner
      const { groupMembership: requestingUserGroupMembership } = requestingUser
      if (isNil(ownerGroupMembership) || isNil(requestingUserGroupMembership)) {
        return currentAccess
      }

      if (matchesGrantLevel(grantLevel, ownerGroupMembership, requestingUserGroupMembership)) {
        return accessGrant.accessType
      }

      return currentAccess
    },
    AccessTypes.NO_ACCESS
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

export default determineAccess
