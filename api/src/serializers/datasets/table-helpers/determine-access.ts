import { isEmpty, isNil, isUndefined } from "lodash"

import { Dataset, User, AccessGrant } from "@/models"
import { AccessTypes, GrantLevels, orderOfAccessType } from "@/models/access-grant"

export function determineAccess(record: Dataset, requestingUser: User): AccessTypes {
  const { accessGrants, owner } = record

  if (isUndefined(accessGrants) || isEmpty(accessGrants)) {
    return AccessTypes.NO_ACCESS
  }

  const accessType = accessGrants.reduce<AccessTypes>(
    (currentAccess: AccessTypes, accessGrant: AccessGrant) => {
      if (orderOfAccessType(currentAccess) > orderOfAccessType(accessGrant.accessType)) {
        return currentAccess
      }

      if (accessGrant.grantLevel === GrantLevels.GOVERNMENT_WIDE) {
        return accessGrant.accessType
      }

      if (
        accessGrant.grantLevel === GrantLevels.DEPARTMENT &&
        !isUndefined(owner) &&
        !isNil(owner.groupMembership?.departmentId) &&
        owner.groupMembership?.departmentId === requestingUser.groupMembership?.departmentId
      ) {
        return accessGrant.accessType
      }

      if (
        accessGrant.grantLevel === GrantLevels.DIVISION &&
        !isUndefined(owner) &&
        !isNil(owner.groupMembership?.divisionId) &&
        !isNil(owner.groupMembership?.departmentId) &&
        owner.groupMembership?.departmentId === requestingUser.groupMembership?.departmentId &&
        owner.groupMembership?.divisionId === requestingUser.groupMembership?.divisionId
      ) {
        return accessGrant.accessType
      }

      if (
        accessGrant.grantLevel === GrantLevels.BRANCH &&
        !isUndefined(owner) &&
        !isNil(owner.groupMembership?.divisionId) &&
        !isNil(owner.groupMembership?.departmentId) &&
        owner.groupMembership?.departmentId === requestingUser.groupMembership?.departmentId &&
        owner.groupMembership?.divisionId === requestingUser.groupMembership?.divisionId &&
        owner.groupMembership?.branchId === requestingUser.groupMembership?.branchId
      ) {
        return accessGrant.accessType
      }

      if (
        accessGrant.grantLevel === GrantLevels.UNIT &&
        !isUndefined(owner) &&
        !isNil(owner.groupMembership?.divisionId) &&
        !isNil(owner.groupMembership?.departmentId) &&
        owner.groupMembership?.departmentId === requestingUser.groupMembership?.departmentId &&
        owner.groupMembership?.divisionId === requestingUser.groupMembership?.divisionId &&
        owner.groupMembership?.branchId === requestingUser.groupMembership?.branchId &&
        owner.groupMembership?.unitId === requestingUser.groupMembership?.unitId
      ) {
        return accessGrant.accessType
      }

      return currentAccess
    },
    AccessTypes.NO_ACCESS
  )

  return accessType
}

export default determineAccess
