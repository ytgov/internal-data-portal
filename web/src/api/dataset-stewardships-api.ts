import http from "@/api/http-client"

import { type Dataset } from "@/api/datasets-api"
import { type User } from "@/api/users-api"
import { type UserGroup } from "@/api/user-groups-api"

export type DatasetStewardship = {
  datasetId: Dataset["id"]
  ownerId: User["id"]
  supportId: User["id"]
  departmentId: UserGroup["id"]
  divisionId: UserGroup["id"]
  branchId: UserGroup["id"]
  unitId: UserGroup["id"]
  createdAt: string
  updatedAt: string

  // associations
  dataset?: Dataset
  owner?: User
  support?: User
  department?: UserGroup
  division?: UserGroup
  branch?: UserGroup
  unit?: UserGroup
}

export const datasetStewardshipsApi = {
  // TODO: implement in back-end
  async list(params: {
    where?: Record<string, unknown> // TODO: consider adding Sequelize types to front-end?
    page?: number
    perPage?: number
  }): Promise<{
    datasetStewardships: DatasetStewardship[]
    totalCount: number
  }> {
    const { data } = await http.get("/api/dataset-stewardships", { params })
    return data
  },
}

export default datasetStewardshipsApi
