import http from "@/api/http-client"

export type Status = {
  RELEASE_TAG: string
  GIT_COMMIT_HASH: string
}

export const statusApi = {
  async fetchStatus(): Promise<Status> {
    const { data } = await http.get("_status")
    return data
  },
}

export default statusApi
