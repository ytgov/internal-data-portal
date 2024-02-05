import { isEmpty, isUndefined } from "lodash"

import { Dataset, User } from "@/models"
import { AccessTypes } from "@/models/access-grant"

export function determineAccess(record: Dataset, requestingUser: User): AccessTypes {
  const { accessGrants } = record
  if (isUndefined(accessGrants) || isEmpty(accessGrants)) {
    return AccessTypes.NO_ACCESS
  }

  const matchingAccessGrants = accessGrants.filter((accessGrant) => {
    if (accessGrant.accessType === AccessTypes.OPEN_ACCESS) {
      return true
    }

    // if (accessGrant.accessType === AccessTypes.SELF_SERVE_ACCESS && ) {

    return false
  })

  if (isEmpty(matchingAccessGrants)) {
    return AccessTypes.NO_ACCESS
  }

  const openAccessGrants = matchingAccessGrants.filter(
    (accessGrant) => accessGrant.accessType === AccessTypes.OPEN_ACCESS
  )
  if (!isEmpty(openAccessGrants)) {
    return AccessTypes.OPEN_ACCESS
  }

  return AccessTypes.NO_ACCESS
}

export default determineAccess
