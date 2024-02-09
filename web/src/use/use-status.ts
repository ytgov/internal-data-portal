import { reactive, toRefs } from "vue"

import statusApi, { Status } from "@/api/status-api"

export function useStatus() {
  const state = reactive<{
    status: Status | null
    isLoading: boolean
    isErrored: boolean
  }>({
    status: null,
    isLoading: false,
    isErrored: false,
  })

  async function fetch(): Promise<Status> {
    state.isLoading = true
    try {
      const status = await statusApi.fetchStatus()
      state.isErrored = false
      state.status = status
      return status
    } catch (error) {
      console.error("Failed to fetch status:", error)
      state.isErrored = true
      throw error
    } finally {
      state.isLoading = false
    }
  }

  return {
    ...toRefs(state),
    fetch,
    refresh: fetch,
  }
}

export default useStatus
