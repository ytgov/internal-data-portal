import { type Ref, reactive, unref, watch, toRefs } from "vue"
import { isNil } from "lodash"

import visualizationControlsApi, { VisualizationControl } from "@/api/visualization-controls-api"

export function useVisualizationControl(visualizationControlId: Ref<number>) {
  const state = reactive<{
    visualizationControl: VisualizationControl | null
    isLoading: boolean
    isErrored: boolean
  }>({
    visualizationControl: null,
    isLoading: false,
    isErrored: false,
  })

  async function fetch() {
    state.isLoading = true
    try {
      const { visualizationControl } = await visualizationControlsApi.get(
        unref(visualizationControlId)
      )
      state.visualizationControl = visualizationControl
      state.isErrored = false
      return visualizationControl
    } catch (error) {
      console.error("Failed to fetch visualization control:", error)
      state.isErrored = true
      throw error
    } finally {
      state.isLoading = false
    }
  }

  async function save() {
    if (isNil(state.visualizationControl)) {
      throw new Error("No visualization control to save")
    }

    state.isLoading = true
    try {
      const { visualizationControl } = await visualizationControlsApi.update(
        unref(visualizationControlId),
        state.visualizationControl
      )
      state.visualizationControl = visualizationControl
      state.isErrored = false
      return visualizationControl
    } catch (error) {
      console.error("Failed to save visualizationControl:", error)
      state.isErrored = true
      throw error
    } finally {
      state.isLoading = false
    }
  }

  watch(
    () => unref(visualizationControlId),
    async () => {
      await fetch()
    },
    { immediate: true }
  )

  return {
    ...toRefs(state),
    refresh: fetch,
    save,
  }
}

export default useVisualizationControl
