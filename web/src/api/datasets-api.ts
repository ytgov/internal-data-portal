import http from "@/api/http-client"

import { type User } from "@/api/users-api"

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
  subscriptionUrl: string | null
  subscriptionAccessCode: string | null
  isSubscribable: boolean
  isSpatialData: boolean
  isLiveData: boolean
  termsOfUse: string | null
  credits: string | null
  ownerNotes: string | null
  status: DatasetErrorTypes
  errorCode: string | null
  errorDetails: string | null
  publishedAt: string | null
  deactivatedAt: string | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export type StewardshipEvolution = {
  ownerId: User["id"]
  supportId: User["id"]
  ownerName: User["displayName"]
  ownerPosition: User["position"]
  supportName: User["displayName"]
  supportEmail: User["email"]
  supportPosition: User["position"]
  department: User["department"]
  division: User["division"]
  branch: User["branch"]
  unit: User["unit"]
}

export type DatasetDetailedResult = Dataset & {
  owner: User
  creator: User
  stewardshipEvolutions: StewardshipEvolution[]
}

export const datasetsApi = {
  DatasetErrorTypes,
  async list(params: {
    where?: Record<string, unknown> // TODO: consider adding Sequelize types to front-end?
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
  }> {
    const { data } = await http.get(`/api/datasets/${idOrSlug}`)
    return data
  },
  async create(
    attributes: Partial<Dataset> & {
      stewardshipEvolutionsAttributes: Partial<StewardshipEvolution>[]
    }
  ): Promise<{
    dataset: DatasetDetailedResult
  }> {
    const { data } = await http.post("/api/datasets", attributes)
    return data
  },
}

export default datasetsApi
