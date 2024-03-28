import http from "@/api/http-client"

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
  role: RoleTypes
  createdAt: Date
  updatedAt: Date
  deletedAt: Date
}

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
  auth0Subject: string | null
  email: string
  firstName: string | null
  lastName: string | null
  position: string | null
  department: string | null
  division: string | null
  branch: string | null
  unit: string | null
  setupFromEmailFirstLogin: boolean
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

export type UserCreationAttributes = Partial<User> & {
  groupMembershipAttributes?: Partial<GroupMembership>
  rolesAttributes?: Partial<Role>[]
}

// Keep in sync with api/src/models/user.ts -> scopes
export type UsersFilters = {
  withPresenceOf?: string[]
  withDeleted?: boolean
}

export const usersApi = {
  RoleTypes,
  // TODO: consider moving this to its own api?
  async fetchCurrentUser(): Promise<{ user: User }> {
    const { data } = await http.get("/api/current-user")
    return data
  },
  async list(
    params: {
      where?: Record<string, unknown> // TODO: consider adding Sequelize types to front-end?
      filters?: UsersFilters
      page?: number
      perPage?: number
    } = {}
  ): Promise<{
    users: User[]
    totalCount: number
  }> {
    const { data } = await http.get("/api/users", { params })
    return data
  },
  async get(
    id: number,
    params: {
      withDeleted?: boolean
    } = {}
  ): Promise<{ user: User }> {
    const { data } = await http.get(`/api/users/${id}`, { params })
    return data
  },
  async create(attributes: UserCreationAttributes): Promise<{
    user: User
  }> {
    const { data } = await http.post("/api/users", attributes)
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
  async delete(userId: number): Promise<void> {
    const { data } = await http.delete(`/api/users/${userId}`)
    return data
  },

  // Special Endpoints
  async search(
    searchToken: string,
    params: {
      filters?: UsersFilters
      page?: number
      perPage?: number
    } = {}
  ): Promise<{ users: User[]; totalCount: number }> {
    const { data } = await http.get(`/api/users/search/${searchToken}`, {
      params,
    })
    return data
  },
  async sync(userId: number): Promise<{ user: User }> {
    const { data } = await http.post(`/api/users/${userId}/sync`)
    return data
  },
}

export default usersApi
