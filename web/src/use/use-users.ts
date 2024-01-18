import { type Ref, reactive, toRefs, unref, watch } from "vue"

import usersApi, { type User } from "@/api/users-api"

export function useUsers({
  where,
  page,
  perPage,
}: {
  where?: Ref<Record<string, any>>
  page?: Ref<number>
  perPage?: Ref<number>
} = {}) {
  const state = reactive<{
    users: User[]
    isLoading: boolean
    isErrored: boolean
  }>({
    users: [],
    isLoading: false,
    isErrored: false,
  })

  async function fetch(): Promise<User[]> {
    state.isLoading = true
    try {
      const { users } = await usersApi.list({
        where: where?.value,
        page: page?.value,
        perPage: perPage?.value,
      })
      state.isErrored = false
      state.users = users
      return users
    } catch (error) {
      console.error("Failed to fetch users:", error)
      state.isErrored = true
      throw error
    } finally {
      state.isLoading = false
    }
  }

  watch(
    () => [where?.value, page?.value, perPage?.value],
    async () => {
      await fetch()
    },
    { immediate: true }
  )

  return {
    ...toRefs(state),
    fetch,
    refresh: fetch,
  }
}

export default useUsers
