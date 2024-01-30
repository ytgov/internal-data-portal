import { type Ref, reactive, toRefs, ref, unref, watch } from "vue"

import datasetsApi, { type Dataset, type StewardshipEvolution } from "@/api/datasets-api"

export { type Dataset, type StewardshipEvolution }

export function useDatasets(
  options: Ref<{
    where?: Record<string, any>
    page?: number
    perPage?: number
  }> = ref({})
) {
  const state = reactive<{
    datasets: Dataset[]
    totalCount: number
    isLoading: boolean
    isErrored: boolean
  }>({
    datasets: [],
    totalCount: 0,
    isLoading: false,
    isErrored: false,
  })

  async function fetch(): Promise<Dataset[]> {
    state.isLoading = true
    try {
      const { datasets, totalCount } = await datasetsApi.list(unref(options))
      state.isErrored = false
      state.datasets = datasets
      state.totalCount = totalCount
      return datasets
    } catch (error) {
      console.error("Failed to fetch datasets:", error)
      state.isErrored = true
      throw error
    } finally {
      state.isLoading = false
    }
  }

  watch(
    () => unref(options),
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

export default useDatasets
