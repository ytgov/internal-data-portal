import http from "@/api/http-client"

import { type Dataset } from "@/api/datasets-api"
import { type User } from "@/api/users-api"
import { type UserGroup } from "@/api/user-groups-api"

export type DatasetStewardship = {
  id: number
  datasetId: Dataset["id"]
  ownerId: User["id"]
  supportId: User["id"]
  departmentId: UserGroup["id"]
  divisionId: UserGroup["id"] | null
  branchId: UserGroup["id"] | null
  unitId: UserGroup["id"] | null
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
  async get(id: number): Promise<{
    datasetStewardship: DatasetStewardship
  }> {
    const { data } = await http.get(`/api/dataset-stewardships/${id}`)
    return data
  },
  async update(
    id: number,
    datasetStewardship: Partial<DatasetStewardship>
  ): Promise<{
    datasetStewardship: DatasetStewardship
  }> {
    const { data } = await http.patch(`/api/dataset-stewardships/${id}`, datasetStewardship)
    return data
  },
}

export default datasetStewardshipsApi
