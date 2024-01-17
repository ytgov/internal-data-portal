import http from "@/api/http-client"

export type User = {
  id: number
  auth0Subject: string
  email: string
  firstName: string | null
  lastName: string | null
  position: string | null
  department: string | null
  division: string | null
  branch: string | null
  unit: string | null
  createdAt: Date // might actual be string
  updatedAt: Date // might actual be string
  deletedAt: Date // might actual be string

  // associations
  roles: Role[]
}

// Must match roles in api/src/models/roles.ts
export enum RoleTypes {
  DATA_OWNER = "data_owner",
  USER = "user",
  SYSTEM_ADMIN = "system_admin",
  BUSINESS_ANALYST = "business_analyst",
}

export type Role = {
  id: number
  userId: User["id"]
  role: RoleTypes[]
  createdAt: Date
  updatedAt: Date
  deletedAt: Date
}

export const usersApi = {
  RoleTypes,
  async fetchCurrentUser(): Promise<{ user: User }> {
    const { data } = await http.get("/api/current-user")
    return data
  },
}

export default usersApi
