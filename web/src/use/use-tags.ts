import { type Ref, reactive, toRefs, ref, unref, watch, nextTick } from "vue"
import { debounce } from "lodash"

import tagsApi, { type Tag } from "@/api/tags-api"

export { type Tag }

export function useTags(
  queryOptions: Ref<{
    where?: Record<string, unknown>
    searchToken?: string
    page?: number
    perPage?: number
  }> = ref({}),
  {
    wait = 0,
    immediate = true,
  }: {
    wait?: number
    immediate?: boolean
  } = {}
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

  const debouncedFetch = debounce(fetch, wait)
  const cancelDebouncedFetch = async () => {
    await nextTick()
    debouncedFetch.cancel()
  }

  watch(
    () => unref(queryOptions),
    async () => {
      state.isLoading = true
      await debouncedFetch()
      state.isLoading = false
    },
    { deep: true, immediate }
  )

  return {
    ...toRefs(state),
    fetch,
    refresh: fetch,
    cancel: cancelDebouncedFetch,
  }
}

export default useTags
