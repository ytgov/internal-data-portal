import http from "@/api/http-client"

import { AccessGrant } from "@/api/access-grants-api"
import { Dataset } from "@/api/datasets-api"
import { DatasetIntegration } from "@/api/dataset-integrations-api"
import { User } from "@/api/users-api"
import { UserGroup } from "@/api/user-groups-api"

export type AccessRequest = {
  id: number
  datasetId: Dataset["id"]
  accessGrantId: AccessGrant["id"]
  requestorId: User["id"]
  denierId: User["id"] | null
  approverId: User["id"] | null
  revokerId: User["id"] | null
  accessCode: string
  projectName: string | null
  projectDescription: string | null
  approvedAt: string | null
  deniedAt: string | null
  denialReason: string | null
  createdAt: string
  updatedAt: string
}

export enum AccessRequestTableStatuses {
  ACCESS_DENIED = "access_denied",
  ACCESS_GRANTED = "access_granted",
  ACCESS_REQUESTED = "access_requested",
  ACCESS_REVOKED = "access_revoked",
}

// Keep in sync with api/src/serializers/access-requests/table-serializer.ts
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

// Keep in sync with api/src/models/access-request.ts -> scopes
export type AccessRequestsFilters = {
  withDatasetOwnerId?: number
}

export const accessRequestsApi = {
  async list(params: {
    where?: Record<string, unknown> // TODO: consider adding Sequelize types to front-end?
    filters?: AccessRequestsFilters
    page?: number
    perPage?: number
  } = {}): Promise<{
    accessRequests: AccessRequestTableView[]
    totalCount: number
  }> {
    const { data } = await http.get("/api/access-requests", {
      params,
    })
    return data
  },
  async create(attributes: Partial<AccessRequest>): Promise<{
    accessRequest: AccessRequest
  }> {
    const { data } = await http.post("/api/access-requests", attributes)
    return data
  },
  // Stateful actions
  async approve(accessRequestId: number): Promise<{
    accessRequest: AccessRequest
  }> {
    const { data } = await http.post(`/api/access-requests/${accessRequestId}/approve`)
    return data
  },
  async deny(
    accessRequestId: number,
    attributes: {
      denialReason: AccessRequest["denialReason"]
    }
  ): Promise<{
    accessRequest: AccessRequest
  }> {
    const { data } = await http.post(`/api/access-requests/${accessRequestId}/deny`, attributes)
    return data
  },
  async revoke(accessRequestId: number): Promise<{
    accessRequest: AccessRequest
  }> {
    const { data } = await http.post(`/api/access-requests/${accessRequestId}/revoke`)
    return data
  },
}

export default accessRequestsApi
