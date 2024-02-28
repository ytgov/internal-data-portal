import { isEmpty, isNil, isUndefined } from "lodash"

import User from "@/models/user"
import Dataset from "@/models/dataset"

export function datasetHasApprovedAccessRequestFor(record: Dataset, user: User): boolean {
  const { accessRequests } = record

  if (isUndefined(accessRequests)) {
    throw new Error("Expected record to have accessRequests association")
  }

  if (isNil(accessRequests) || isEmpty(accessRequests) || isNil(user.id)) {
    return false
  }

  for (const accessRequest of accessRequests) {
    if (accessRequest.requestorId === user.id && !isNil(accessRequest.approvedAt)) {
      return true
    }
  }

  return false
}

export default datasetHasApprovedAccessRequestFor
