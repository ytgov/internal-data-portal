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
  createdAt: Date // might actual be string
  updatedAt: Date // might actual be string
  deletedAt: Date // might actual be string

  parent: UserGroup | null
  childrens: UserGroup[]
}

export const userGroupsApi = {
  Types: UserGroupTypes,
  async sync(): Promise<{ userGroups: UserGroup[] }> {
    const { data } = await http.post("/api/user-groups/yukon-government-directory-sync")
    return data
  },
  async list({
    where,
    page,
    perPage,
  }: {
    where?: Record<string, any> // TODO: consider adding Sequelize types to front-end?
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
