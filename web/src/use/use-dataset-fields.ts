import { type Ref, reactive, toRefs, ref, unref, watch } from "vue"

import datasetFieldsApi, { type DatasetField } from "@/api/dataset-fields-api"

export { type DatasetField }

export function useDatasetFields(
  queryOptions: Ref<{
    where?: Record<string, unknown>
    page?: number
    perPage?: number
  }> = ref({})
) {
  const state = reactive<{
    datasetFields: DatasetField[]
    totalCount: number
    isLoading: boolean
    isErrored: boolean
  }>({
    datasetFields: [],
    totalCount: 0,
    isLoading: false,
    isErrored: false,
  })

  async function fetch(): Promise<DatasetField[]> {
    state.isLoading = true
    try {
      const { datasetFields, totalCount } = await datasetFieldsApi.list(unref(queryOptions))
      state.isErrored = false
      state.datasetFields = datasetFields
      state.totalCount = totalCount
      return datasetFields
    } catch (error) {
      console.error("Failed to fetch dataset fields:", error)
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

export default useDatasetFields
