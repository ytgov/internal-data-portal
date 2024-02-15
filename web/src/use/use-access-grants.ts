import { type Ref, reactive, toRefs, ref, unref, watch } from "vue"

import accessGrantsApi, { type AccessGrant } from "@/api/access-grants-api"

export { type AccessGrant }

export function useAccessGrants(
  queryOptions: Ref<{
    where?: Record<string, unknown>
    page?: number
    perPage?: number
  }> = ref({})
) {
  const state = reactive<{
    accessGrants: AccessGrant[]
    totalCount: number
    isLoading: boolean
    isErrored: boolean
  }>({
    accessGrants: [],
    totalCount: 0,
    isLoading: false,
    isErrored: false,
  })

  async function fetch(): Promise<AccessGrant[]> {
    state.isLoading = true
    try {
      const { accessGrants, totalCount } = await accessGrantsApi.list(unref(queryOptions))
      state.isErrored = false
      state.accessGrants = accessGrants
      state.totalCount = totalCount
      return accessGrants
    } catch (error) {
      console.error("Failed to fetch access grants:", error)
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

export default useAccessGrants
