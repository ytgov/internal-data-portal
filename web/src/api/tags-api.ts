import http from "@/api/http-client"

export type Tag = {
  id: number
  name: string
  createdAt: string
  updatedAt: string
}

export const tagsApi = {
  async list({
    where,
    page,
    perPage,
  }: {
    where?: Record<string, unknown> // TODO: consider adding Sequelize types to front-end?
    page?: number
    perPage?: number
  } = {}): Promise<{
    tags: Tag[]
    totalCount: number
  }> {
    const { data } = await http.get("/api/tags", {
      params: { where, page, perPage },
    })
    return data
  },
}

export default tagsApi
