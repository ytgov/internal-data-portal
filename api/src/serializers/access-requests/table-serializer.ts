import { isNil, pick } from "lodash"

import { AccessGrant, AccessRequest, User, UserGroup } from "@/models"
import BaseSerializer from "@/serializers/base-serializer"

export enum AccessRequestTableStatuses {
  ACCESS_DENIED = "access_denied",
  ACCESS_GRANTED = "access_granted",
  ACCESS_REQUESTED = "access_requested",
  ACCESS_REVOKED = "access_revoked",
}

// Keep in sync with web/src/api/access-requests-api.ts
export type AccessRequestTableView = Pick<
  AccessRequest,
  "id" | "accessCode" | "projectDescription" | "createdAt" | "updatedAt"
> & {
  requestorFirstName: User["firstName"]
  requestorLastName: User["lastName"]
  requestorDepartmentName: UserGroup["name"]
  accessType: AccessGrant["accessType"]
  status: AccessRequestTableStatuses
}

export class TableSerializer extends BaseSerializer<AccessRequest> {
  constructor(
    protected record: AccessRequest,
    protected currentUser: User
  ) {
    super(record)
  }

  perform(): AccessRequestTableView {
    const requestor = this.record.requestor
    if (isNil(requestor)) {
      throw new Error("AccessRequest must include a requestor.")
    }

    const requestorGroupMembership = requestor.groupMembership
    if (isNil(requestorGroupMembership)) {
      throw new Error("Requestor must include a group membership.")
    }

    const requestorDepartment = requestorGroupMembership.department
    if (isNil(requestorDepartment)) {
      throw new Error("Requestor must include a group membership with a department.")
    }

    const accessGrant = this.record.accessGrant
    if (isNil(accessGrant)) {
      throw new Error("AccessRequest must include an access grant.")
    }
    return {
      ...pick(this.record.dataValues, [
        "id",
        "accessCode",
        "projectDescription",
        "createdAt",
        "updatedAt",
      ]),
      requestorFirstName: requestor.firstName,
      requestorLastName: requestor.lastName,
      requestorDepartmentName: requestorDepartment.name,
      accessType: accessGrant.accessType,
      status: this.buildStatus(),
    }
  }

  private buildStatus() {
    if (this.record.revokedAt) {
      return AccessRequestTableStatuses.ACCESS_REVOKED
    } else if (this.record.deniedAt) {
      return AccessRequestTableStatuses.ACCESS_DENIED
    } else if (this.record.approvedAt) {
      return AccessRequestTableStatuses.ACCESS_GRANTED
    } else {
      return AccessRequestTableStatuses.ACCESS_REQUESTED
    }
  }
}
