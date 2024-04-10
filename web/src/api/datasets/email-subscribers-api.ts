import http from "@/api/http-client"

import { type User } from "@/api/users-api"

export type Mail = {
  to: string[]
  subject: string
  body: string
}

export const emailSubscribersApi = {
  async list(
    datasetId: number,
    params: {
      where?: Record<string, unknown> // TODO: consider adding Sequelize types to front-end?
      page?: number
      perPage?: number
    } = {}
  ): Promise<{
    users: User[]
    totalCount: number
  }> {
    const { data } = await http.get(`/api/datasets/${datasetId}/email-subscribers`, {
      params,
    })
    return data
  },
  async create(
    datasetId: number,
    attributes: Mail
  ): Promise<{
    message: string
  }> {
    const { data } = await http.post(`/api/datasets/${datasetId}/email-subscribers`, attributes)
    return data
  },
}

export default emailSubscribersApi
