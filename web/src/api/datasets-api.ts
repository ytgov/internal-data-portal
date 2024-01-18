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

export const usersApi = {
  DatasetErrorTypes,
  async create(attributes: Partial<Dataset>): Promise<{ dataset: Dataset }> {
    const { data } = await http.post("/api/datasets", attributes)
    return data
  },
}

export default usersApi
