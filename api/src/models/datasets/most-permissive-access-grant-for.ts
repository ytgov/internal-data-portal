import { isEmpty, isNil } from "lodash"

import { Dataset, User, AccessGrant } from "@/models"
import { AccessTypes, orderOfAccessType } from "@/models/access-grant"
import { matchesGrantLevel } from "@/models/access-grants"

// TODO: consider if this function should load associations if they were not supplied?
// Or at least error informatively?
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

export default mostPermissiveAccessGrantFor
