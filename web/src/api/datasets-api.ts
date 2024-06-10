import http from "@/api/http-client"

import { type Policy } from "@/api/base-api"
import { type AccessGrant } from "@/api/access-grants-api"
import { type AccessRequest } from "@/api/access-requests-api"
import { type DatasetFile } from "@/api/datasets/dataset-files-api"
import { type DatasetIntegration } from "@/api/dataset-integrations-api"
import { type DatasetStewardship } from "@/api/dataset-stewardships-api"
import { type User } from "@/api/users-api"
import { type UserGroup } from "@/api/user-groups-api"
import { type VisualizationControl } from "@/api/visualization-controls-api"

export enum DatasetErrorTypes {
  OK = "ok",
  ERRORED = "errored",
}

export type Dataset = {
  id: number
  ownerId: User["id"]
  creatorId: User["id"]
  slug: string
  name: string
  description: string
  isSpatialData: boolean
  isLiveData: boolean
  termsOfUse: string | null
  credits: string | null
  ownerNotes: string | null
  publishedAt: string | null
  deactivatedAt: string | null
  createdAt: string
  updatedAt: string

  // associations
  owner?: User
  creator?: User
  file?: DatasetFile
  integration?: DatasetIntegration
  stewardship?: DatasetStewardship
  visualizationControl?: VisualizationControl

  // magic fields
  currentUserAccessGrant?: AccessGrant | null
  currentUserAccessRequest?: AccessRequest | null
}

export type DatasetDetailedResult = Dataset & {
  owner: User
  creator: User
  file?: DatasetFile
  integration?: DatasetIntegration
  stewardship: DatasetStewardship
  visualizationControl: VisualizationControl

  // magic fields
  currentUserAccessGrant: AccessGrant | null
  currentUserAccessRequest: AccessRequest | null
}

// Keep in sync with api/src/models/dataset.ts -> scopes
export type DatasetsFilters = {
  search?: string
  withOwnerDepartment?: UserGroup["id"]
  withTagNames?: string[]
}

export type DatasetPolicy = Policy & {
  showUnlimited: boolean
}

export const datasetsApi = {
  DatasetErrorTypes,
  async list(params: {
    where?: Record<string, unknown> // TODO: consider adding Sequelize types to front-end?
    filters?: DatasetsFilters
    page?: number
    perPage?: number
  }): Promise<{
    datasets: Dataset[]
    totalCount: number
  }> {
    const { data } = await http.get("/api/datasets", { params })
    return data
  },
  async get(idOrSlug: number | string): Promise<{
    dataset: DatasetDetailedResult
    policy: DatasetPolicy
  }> {
    const { data } = await http.get(`/api/datasets/${idOrSlug}`)
    return data
  },
  async create(
    attributes: Partial<Dataset> & {
      stewardshipAttributes: Partial<DatasetStewardship>
    }
  ): Promise<{
    dataset: DatasetDetailedResult
  }> {
    const { data } = await http.post("/api/datasets", attributes)
    return data
  },
  async update(
    idOrSlug: number | string,
    attributes: Partial<Dataset>
  ): Promise<{
    dataset: DatasetDetailedResult
  }> {
    const { data } = await http.patch(`/api/datasets/${idOrSlug}`, attributes)
    return data
  },
}

export default datasetsApi
