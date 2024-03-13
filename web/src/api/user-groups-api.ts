import http from "@/api/http-client"

export enum UserGroupTypes {
  DEPARTMENT = "department",
  DIVISION = "division",
  BRANCH = "branch",
  UNIT = "unit",
}

export type UserGroup = {
  id: number
  parentId: number
  name: string
  type: UserGroupTypes
  order: number
  createdAt: string
  updatedAt: string

  // Associations
  parent: UserGroup | null
  children: UserGroup[]
}

export const userGroupsApi = {
  Types: UserGroupTypes,
  async sync(): Promise<{ userGroups: UserGroup[] }> {
    const { data } = await http.post("/api/user-groups/sync")
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
    userGroups: UserGroup[]
    totalCount: number
  }> {
    const { data } = await http.get("/api/user-groups", {
      params: { where, page, perPage },
    })
    return data
  },
}

export default userGroupsApi
