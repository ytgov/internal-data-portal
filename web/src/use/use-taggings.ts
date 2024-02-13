import { type Ref, reactive, toRefs, ref, unref, watch } from "vue"

import taggingsApi, { type Tagging } from "@/api/taggings-api"

export { type Tagging }

export function useTaggings(
  queryOptions: Ref<{
    where?: Record<string, unknown>
    page?: number
    perPage?: number
  }> = ref({}),
  {
    immediate = true,
  }: {
    immediate?: boolean
  } = {}
) {
  const state = reactive<{
    taggings: Tagging[]
    isLoading: boolean
    isErrored: boolean
  }>({
    taggings: [],
    isLoading: false,
    isErrored: false,
  })

  async function fetch(): Promise<Tagging[]> {
    state.isLoading = true
    try {
      const { taggings } = await taggingsApi.list(unref(queryOptions))
      state.isErrored = false
      state.taggings = taggings
      return taggings
    } catch (error) {
      console.error("Failed to fetch taggings:", error)
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
    { deep: true, immediate }
  )

  return {
    ...toRefs(state),
    fetch,
    refresh: fetch,
  }
}

export default useTaggings
