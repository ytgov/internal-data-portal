import { type Ref, reactive, toRefs, ref, unref, watch } from "vue"

import accessRequestsApi, { type AccessRequest } from "@/api/access-requests-api"

export { type AccessRequest }

export function useAccessRequests(
  queryOptions: Ref<{
    where?: Record<string, unknown>
    page?: number
    perPage?: number
  }> = ref({})
) {
  const state = reactive<{
    accessRequests: AccessRequest[]
    totalCount: number
    isLoading: boolean
    isErrored: boolean
  }>({
    accessRequests: [],
    totalCount: 0,
    isLoading: false,
    isErrored: false,
  })

  async function fetch(): Promise<AccessRequest[]> {
    state.isLoading = true
    try {
      const { accessRequests, totalCount } = await accessRequestsApi.list(unref(queryOptions))
      state.isErrored = false
      state.accessRequests = accessRequests
      state.totalCount = totalCount
      return accessRequests
    } catch (error) {
      console.error("Failed to fetch access requests:", error)
      state.isErrored = true
      throw error
    } finally {
      state.isLoading = false
    }
  }

  watch(
    () => unref(queryOptions),
    async () => {
      await fetch()
    },
    { deep: true, immediate: true }
  )

  return {
    ...toRefs(state),
    fetch,
    refresh: fetch,
  }
}

export default useAccessRequests
