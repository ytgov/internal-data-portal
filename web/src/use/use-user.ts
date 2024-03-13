import { type Ref, reactive, unref, watch, toRefs } from "vue"
import { isNil } from "lodash"

import usersApi, { type User, type UserUpdate } from "@/api/users-api"

export { type User, type UserUpdate }

export function useUser(
  id: Ref<number | null | undefined>,
  {
    immediate = true,
  }: {
    immediate?: boolean
  } = {}
) {
  const state = reactive<{
    user: User | null
    isLoading: boolean
    isErrored: boolean
  }>({
    user: null,
    isLoading: false,
    isErrored: false,
  })

  async function fetch() {
    const staticId = unref(id)
    if (isNil(staticId)) {
      throw new Error("id is required")
    }

    state.isLoading = true
    try {
      const { user } = await usersApi.get(staticId)
      state.user = user
      state.isErrored = false
      return user
    } catch (error) {
      console.error("Failed to fetch user:", error)
      state.isErrored = true
      throw error
    } finally {
      state.isLoading = false
    }
  }

  async function save(customAttributes: UserUpdate): Promise<User> {
    const staticId = unref(id)
    if (isNil(staticId)) {
      throw new Error("id is required")
    }

    const attributes = {
      ...state.user,
      ...customAttributes,
    }

    state.isLoading = true
    try {
      const { user } = await usersApi.update(staticId, attributes)
      state.isErrored = false
      state.user = user
      return user
    } catch (error) {
      console.error("Failed to save current user:", error)
      state.isErrored = true
      throw error
    } finally {
      state.isLoading = false
    }
  }

  watch(
    () => unref(id),
    async (newId) => {
      if (isNil(newId)) return

      await fetch()
    },
    { immediate }
  )

  return {
    ...toRefs(state),
    fetch,
    refresh: fetch,
    save,
  }
}

export default useUser
