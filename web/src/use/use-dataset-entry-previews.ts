import { type Ref, reactive, toRefs, ref, unref, watch } from "vue"

import datasetEntryPreviewsApi, {
  type DatasetEntryPreview,
  type DatasetEntryPreviewFilters,
} from "@/api/dataset-entry-previews-api"

export { type DatasetEntryPreview, type DatasetEntryPreviewFilters }

export function useDatasetEntryPreview(
  queryOptions: Ref<{
    where?: Record<string, unknown>
    filters?: DatasetEntryPreviewFilters
    page?: number
    perPage?: number
  }> = ref({})
) {
  const state = reactive<{
    datasetEntryPreviews: DatasetEntryPreview[]
    totalCount: number
    isLoading: boolean
    isErrored: boolean
  }>({
    datasetEntryPreviews: [],
    totalCount: 0,
    isLoading: false,
    isErrored: false,
  })

  async function fetch(): Promise<DatasetEntryPreview[]> {
    state.isLoading = true
    try {
      const { datasetEntryPreviews, totalCount } = await datasetEntryPreviewsApi.list(
        unref(queryOptions)
      )
      state.isErrored = false
      state.datasetEntryPreviews = datasetEntryPreviews
      state.totalCount = totalCount
      return datasetEntryPreviews
    } catch (error) {
      console.error("Failed to fetch dataset entry previews:", error)
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

export default useDatasetEntryPreview
