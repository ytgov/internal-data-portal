import { type Ref, reactive, unref, watch, toRefs } from "vue"

import datasetsApi, { Dataset } from "@/api/datasets-api"

export function useDataset(slug: Ref<string>) {
  const state = reactive<{
    dataset: Dataset | null
    isLoading: boolean
    isErrored: boolean
  }>({
    dataset: null,
    isLoading: false,
    isErrored: false,
  })

  async function fetch() {
    state.isLoading = true
    try {
      const { dataset } = await datasetsApi.get(unref(slug))
      state.dataset = dataset
      state.isErrored = false
      return dataset
    } catch (error) {
      console.error("Failed to fetch dataset:", error)
      state.isErrored = true
      throw error
    } finally {
      state.isLoading = false
    }
  }

  watch(
    () => unref(slug),
    async () => {
      await fetch()
    },
    { immediate: true }
  )

  return {
    ...toRefs(state),
    refresh: fetch,
  }
}

export default useDataset
