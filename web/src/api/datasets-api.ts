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
  subscriptionUrl: string
  subscriptionAccessCode: string
  isSubscribable: boolean
  isSpatialData: boolean
  isLiveData: boolean
  termsOfUse: string
  credits: string
  ownerNotes: string
  status: DatasetErrorTypes
  errorCode: string
  errorDetails: string
  publishedAt: Date // might actual be string
  deactivatedAt: Date // might actual be string
  createdAt: Date // might actual be string
  updatedAt: Date // might actual be string
  deletedAt: Date // might actual be string
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

export const usersApi = {
  DatasetErrorTypes,
  async create(
    attributes: Partial<Dataset> & {
      stewardshipEvolutionsAttributes: Partial<StewardshipEvolution>[]
    }
  ): Promise<{ dataset: Dataset }> {
    const { data } = await http.post("/api/datasets", attributes)
    return data
  },
}

export default usersApi
