import { type Ref, reactive, toRefs, ref, unref, watch } from "vue"

import datasetEntriesApi, { type DatasetEntry } from "@/api/dataset-entries-api"

export { type DatasetEntry }

export function useDatasetEntries(
  queryOptions: Ref<{
    where?: Record<string, unknown>
    searchToken?: string
    page?: number
    perPage?: number
  }> = ref({})
) {
  const state = reactive<{
    datasetEntries: DatasetEntry[]
    totalCount: number
    isLoading: boolean
    isErrored: boolean
  }>({
    datasetEntries: [],
    totalCount: 0,
    isLoading: false,
    isErrored: false,
  })

  async function fetch(): Promise<DatasetEntry[]> {
    state.isLoading = true
    try {
      const { datasetEntries, totalCount } = await datasetEntriesApi.list(unref(queryOptions))
      state.isErrored = false
      state.datasetEntries = datasetEntries
      state.totalCount = totalCount
      return datasetEntries
    } catch (error) {
      console.error("Failed to fetch dataset entries:", error)
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

export default useDatasetEntries
