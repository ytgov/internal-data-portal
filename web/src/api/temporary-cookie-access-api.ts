import http from "@/api/http-client"

export const temporaryCookieAccessApi = {
  async create(): Promise<void> {
    await http.post("/api/temporary-access-cookie", undefined, {
      withCredentials: true,
    })
    return void 0
  },
}

export default temporaryCookieAccessApi
