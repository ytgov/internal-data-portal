import { isEmpty, isNil } from "lodash"

import { AccessTypes } from "@/models/access-grant"
import { matchesGrantLevel } from "@/models/access-grants"
import Dataset from "@/models/dataset"
import User from "@/models/user"

export function datasetIsAccessibleViaOpenAccessGrantBy(
  record: Dataset,
  requestingUser: User
): boolean {
  const { accessGrants, owner } = record

  if (isNil(accessGrants) || isEmpty(accessGrants) || isNil(owner)) {
    return false
  }

  const { groupMembership: ownerGroupMembership } = owner
  const { groupMembership: requestingUserGroupMembership } = requestingUser
  if (isNil(ownerGroupMembership) || isNil(requestingUserGroupMembership)) {
    return false
  }

  for (const accessGrant of accessGrants) {
    const { accessType, grantLevel } = accessGrant
    if (
      accessType === AccessTypes.OPEN_ACCESS &&
      matchesGrantLevel(grantLevel, ownerGroupMembership, requestingUserGroupMembership)
    ) {
      return true
    }
  }

  return false
}

export default datasetIsAccessibleViaOpenAccessGrantBy
