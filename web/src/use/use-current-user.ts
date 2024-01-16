import { reactive, toRefs } from "vue"

import { sleep } from "@/utils/sleep"
import usersApi, { User } from "@/api/users-api"

type UserStub = {
  roles: []
}

// Global state
const state = reactive<{
  currentUser: User | UserStub
  isLoading: boolean
  isErrored: boolean
  isCached: boolean
}>({
  currentUser: {
    roles: [],
  },
  isLoading: false,
  isErrored: false,
  isCached: false,
})

export function useCurrentUser() {
  async function fetch(): Promise<User> {
    state.isLoading = true
    try {
      const { user } = await usersApi.fetchCurrentUser()
      state.isErrored = false
      state.currentUser = user
      state.isCached = true
      return user
    } catch (error) {
      console.error("Failed to fetch current user:", error)
      state.isErrored = true
      throw error
    } finally {
      state.isLoading = false
    }
  }

  async function ensure(): Promise<User | UserStub> {
    while (state.isLoading) {
      await sleep(75)
    }

    if (state.isErrored) {
      console.error("Current user store has errored, returning state.currentUser.")
      return state.currentUser
    }

    // Trust the back-end and above logic; when state.isCached, user must be a full user.
    if (state.isCached) return state.currentUser as User

    return fetch()
  }

  // I think this needs to be called during logout or current user will persist?
  function reset() {
    state.currentUser = {
      roles: [],
    }
    state.isLoading = false
    state.isErrored = false
    state.isCached = false
  }

  return {
    ...toRefs(state),
    fetch,
    ensure,
    reset,
  }
}

export default useCurrentUser
