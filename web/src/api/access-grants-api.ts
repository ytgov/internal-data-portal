import http from "@/api/http-client"

import { Dataset } from "@/api/datasets-api"
import { User } from "@/api/users-api"

// Keep in sync with api/src/models/access-grant.ts
export enum GrantLevels {
  GOVERNMENT_WIDE = "government_wide",
  DEPARTMENT = "department",
  DIVISION = "division",
  BRANCH = "branch",
  UNIT = "unit",
}

// Keep in sync with api/src/models/access-grant.ts
export enum AccessTypes {
  // This is a special access type that is not stored in the database
  // "no access" is determined by the absence of any access grants
  // It's only here for repeatable use in other places
  NO_ACCESS = "no_access",
  // Request - I want to control access to my data and need to know how they will use my data,
  // I need to inform them of any changes that are made.
  SCREENED_ACCESS = "screened_access",
  // Subscribe - I am happy to share my data but I need to know who is using it as there might be changes
  SELF_SERVE_ACCESS = "self_serve_access",
  // Open - I don't care who uses my data I am not likely to change it.
  OPEN_ACCESS = "open_access",
}

export type AccessGrant = {
  id: number
  datasetId: Dataset["id"]
  creatorId: User["id"]
  supportId: User["id"] | null
  grantLevel: GrantLevels
  accessType: AccessTypes
  isProjectDescriptionRequired: boolean
  createdAt: string
  updatedAt: string
}

export const accessGrantsApi = {
  async list({
    where,
    page,
    perPage,
  }: {
    where?: Record<string, unknown> // TODO: consider adding Sequelize types to front-end?
    page?: number
    perPage?: number
  } = {}): Promise<{
    accessGrants: AccessGrant[]
    totalCount: number
  }> {
    const { data } = await http.get("/api/access-grants", {
      params: { where, page, perPage },
    })
    return data
  },
  async create(attributes: Partial<AccessGrant>): Promise<{
    accessGrant: AccessGrant
  }> {
    const { data } = await http.post("/api/access-grants", attributes)
    return data
  },
  async update(
    accessGrantId: number,
    attributes: Partial<AccessGrant>
  ): Promise<{
    accessGrant: AccessGrant
  }> {
    const { data } = await http.patch(`/api/access-grants/${accessGrantId}`, attributes)
    return data
  },
  async delete(accessGrantId: number): Promise<void> {
    const { data } = await http.delete(`/api/access-grants/${accessGrantId}`)
    return data
  },
}

export default accessGrantsApi
