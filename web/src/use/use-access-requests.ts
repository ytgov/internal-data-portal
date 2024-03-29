import { type Ref, reactive, toRefs, ref, unref, watch } from "vue"

import accessRequestsApi, {
  AccessRequestTableStatuses,
  type AccessRequest,
  type AccessRequestTableView,
  type AccessRequestsFilters,
} from "@/api/access-requests-api"

export {
  AccessRequestTableStatuses,
  type AccessRequest,
  type AccessRequestTableView,
  type AccessRequestsFilters,
}

export function useAccessRequests(
  queryOptions: Ref<{
    where?: Record<string, unknown>
    filters?: AccessRequestsFilters
    page?: number
    perPage?: number
  }> = ref({}),
  { skipWatchIf = () => false }: { skipWatchIf?: () => boolean } = {}
) {
  const state = reactive<{
    accessRequests: AccessRequestTableView[]
    totalCount: number
    isLoading: boolean
    isErrored: boolean
  }>({
    accessRequests: [],
    totalCount: 0,
    isLoading: false,
    isErrored: false,
  })

  async function fetch(): Promise<AccessRequestTableView[]> {
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
      if (skipWatchIf()) return

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
