import http from "@/api/http-client"

export type GroupMembership = {
  id: number
  userId: number
  departmentId: number
  divisionId: number | null
  branchId: number | null
  unitId: number | null
  groupId: number
  createdAt: string
  updatedAt: string
}

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
  createdAt: string
  updatedAt: string

  roleTypes: RoleTypes[]
  displayName: string

  // associations
  roles: Role[]
  groupMembership: GroupMembership
}

export type UserUpdate = Partial<User> & {
  groupMembershipAttributes?: Partial<GroupMembership>
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
  // TODO: consider moving this to its own api?
  async fetchCurrentUser(): Promise<{ user: User }> {
    const { data } = await http.get("/api/current-user")
    return data
  },
  async list({
    where,
    page,
    perPage,
  }: {
    where?: Record<string, unknown> // TODO: consider adding Sequelize types to front-end?
    page?: number
    perPage?: number
  } = {}): Promise<{
    users: User[]
    totalCount: number
  }> {
    const { data } = await http.get("/api/users", { params: { where, page, perPage } })
    return data
  },
  async get(id: number): Promise<{ user: User }> {
    const { data } = await http.get(`/api/users/${id}`)
    return data
  },
  async update(
    userId: number,
    attributes: Partial<User>
  ): Promise<{
    user: User
  }> {
    const { data } = await http.patch(`/api/users/${userId}`, attributes)
    return data
  },

  // Special Endpoints
  async search(
    searchToken: string,
    {
      page,
      perPage,
    }: {
      page?: number
      perPage?: number
    } = {}
  ): Promise<{ users: User[]; totalCount: number }> {
    const { data } = await http.get(`/api/users/search/${searchToken}`, {
      params: { page, perPage },
    })
    return data
  },
  async sync(userId: number): Promise<{ user: User }> {
    const { data } = await http.post(`/api/users/${userId}/yukon-government-directory-sync`)
    return data
  },
}

export default usersApi
