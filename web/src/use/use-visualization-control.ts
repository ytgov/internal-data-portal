import { type Ref, reactive, unref, watch, toRefs } from "vue"

import visualizationControlsApi, {
  type VisualizationControl,
  type VisualizationControlUpdate,
} from "@/api/visualization-controls-api"

export { type VisualizationControl, type VisualizationControlUpdate }

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

  async function save(customAttributes?: VisualizationControlUpdate) {
    const attributes = {
      ...state.visualizationControl,
      ...customAttributes,
    }

    state.isLoading = true
    try {
      const { visualizationControl } = await visualizationControlsApi.update(
        unref(visualizationControlId),
        attributes
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
