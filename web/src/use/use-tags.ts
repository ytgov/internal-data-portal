import { type Ref, reactive, toRefs, ref, unref, watch } from "vue"

import tagsApi, { type Tag } from "@/api/tags-api"

export { type Tag }

export function useTags(
  queryOptions: Ref<{
    where?: Record<string, unknown>
    page?: number
    perPage?: number
  }> = ref({})
) {
  const state = reactive<{
    tags: Tag[]
    isLoading: boolean
    isErrored: boolean
  }>({
    tags: [],
    isLoading: false,
    isErrored: false,
  })

  async function fetch(): Promise<Tag[]> {
    state.isLoading = true
    try {
      const { tags } = await tagsApi.list(unref(queryOptions))
      state.isErrored = false
      state.tags = tags
      return tags
    } catch (error) {
      console.error("Failed to fetch tags:", error)
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

export default useTags
