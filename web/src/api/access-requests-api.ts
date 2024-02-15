import http from "@/api/http-client"

import { AccessGrant } from "@/api/access-grants-api"
import { Dataset } from "@/api/datasets-api"
import { User } from "@/api/users-api"

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

export const accessRequestsApi = {
  async list({
    where,
    page,
    perPage,
  }: {
    where?: Record<string, unknown> // TODO: consider adding Sequelize types to front-end?
    page?: number
    perPage?: number
  } = {}): Promise<{
    accessRequests: AccessRequest[]
    totalCount: number
  }> {
    const { data } = await http.get("/api/access-requests", {
      params: { where, page, perPage },
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
