import { type Ref, reactive, toRefs, ref, unref, watch } from "vue"

import userGroupsApi, { type UserGroup } from "@/api/user-groups-api"

export function useUserGroups(
  queryOptions: Ref<{
    where?: Record<string, any>
    page?: number
    perPage?: number
  }> = ref({}),
  {
    eager = true,
  }: {
    eager?: boolean
  } = {}
) {
  const state = reactive<{
    userGroups: UserGroup[]
    isLoading: boolean
    isErrored: boolean
  }>({
    userGroups: [],
    isLoading: false,
    isErrored: false,
  })

  async function fetch(): Promise<UserGroup[]> {
    state.isLoading = true
    try {
      const { userGroups } = await userGroupsApi.list(unref(queryOptions))
      state.isErrored = false
      state.userGroups = userGroups
      return userGroups
    } catch (error) {
      console.error("Failed to fetch user groups:", error)
      state.isErrored = true
      throw error
    } finally {
      state.isLoading = false
    }
  }

  watch(
    () => unref(queryOptions),
    async () => {
      if (eager) {
        await fetch()
      }
    },
    { deep: true, immediate: true }
  )

  return {
    ...toRefs(state),
    fetch,
    refresh: fetch,
  }
}

export default useUserGroups
