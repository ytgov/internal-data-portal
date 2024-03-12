import { type Ref, reactive, toRefs, ref, unref, watch } from "vue"

import datasetsApi, { type Dataset } from "@/api/datasets-api"

export { type Dataset }

export function useDatasets(
  options: Ref<{
    where?: Record<string, unknown>
    page?: number
    perPage?: number
  }> = ref({}),
  { skipWatchIf = () => false }: { skipWatchIf?: () => boolean } = {}
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
      if (skipWatchIf()) return

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
