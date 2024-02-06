import { isEmpty, isUndefined } from "lodash"

import { Dataset, User } from "@/models"
import { AccessTypes } from "@/models/access-grant"

// Keep in sync with web/src/components/datasets/DatasetsTable.vue
export enum DatasetTableActions {
  REQUEST_ACCESS = "request_access",
  SUBSCRIBED = "subscribed",
  APPROVED = "approved",
  SUBSCRIBE = "subscribe",
  AWAITING_APPROVAL = "awaiting_approval",
}

export function determineActions(
  dataset: Dataset,
  requestingUser: User,
  accessType: AccessTypes
): DatasetTableActions | void {
  const { accessRequests } = dataset
  if (accessType === AccessTypes.SELF_SERVE_ACCESS) {
    if (isUndefined(accessRequests) || isEmpty(accessRequests)) return DatasetTableActions.SUBSCRIBE

    const accessRequest = accessRequests.find((accessRequest) => {
      return accessRequest.requestorId === requestingUser.id
    })
    if (isUndefined(accessRequest)) return DatasetTableActions.SUBSCRIBE
    if (!accessRequest.isApproved()) return DatasetTableActions.SUBSCRIBE

    return DatasetTableActions.SUBSCRIBED
  }

  if (accessType === AccessTypes.SCREENED_ACCESS) {
    if (isUndefined(accessRequests) || isEmpty(accessRequests))
      return DatasetTableActions.REQUEST_ACCESS

    const accessRequest = accessRequests.find((accessRequest) => {
      return accessRequest.requestorId === requestingUser.id
    })
    if (isUndefined(accessRequest)) return DatasetTableActions.REQUEST_ACCESS
    if (!accessRequest.isApproved()) return DatasetTableActions.AWAITING_APPROVAL

    return DatasetTableActions.APPROVED
  }

  return
}

export default determineActions
