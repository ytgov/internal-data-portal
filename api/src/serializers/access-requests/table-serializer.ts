import { isNil, pick } from "lodash"

import { AccessGrant, AccessRequest, Dataset, DatasetIntegration, User, UserGroup } from "@/models"
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
  | "id"
  | "requestorId"
  | "accessCode"
  | "projectName"
  | "projectDescription"
  | "createdAt"
  | "updatedAt"
> & {
  requestorFirstName: User["firstName"]
  requestorLastName: User["lastName"]
  requestorDepartmentName: UserGroup["name"]
  accessType: AccessGrant["accessType"]
  status: AccessRequestTableStatuses
  dataset: Pick<Dataset, "id" | "name" | "description"> & {
    integration?: Pick<DatasetIntegration, "id" | "status">
  }
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

    const { dataset } = this.record
    if (isNil(dataset)) {
      throw new Error("AccessRequest must include a dataset.")
    }

    let integrationAttributes = {}
    if (!isNil(dataset.integration)) {
      integrationAttributes = {
        integration: {
          id: dataset.integration.id,
          status: dataset.integration.status,
        },
      }
    }

    return {
      ...pick(this.record.dataValues, [
        "id",
        "requestorId",
        "accessCode",
        "projectName",
        "projectDescription",
        "createdAt",
        "updatedAt",
      ]),
      requestorFirstName: requestor.firstName,
      requestorLastName: requestor.lastName,
      requestorDepartmentName: requestorDepartment.name,
      accessType: accessGrant.accessType,
      status: this.buildStatus(),
      dataset: {
        id: dataset.id,
        name: dataset.name,
        description: dataset.description,
        ...integrationAttributes,
      },
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
