import { reactive, toRefs } from "vue"
import { VSnackbar } from "vuetify/lib/components/index.mjs"

type VSnackbarProps = Pick<VSnackbar["$props"], "color">

const state = reactive<{
  message: string
  options: VSnackbarProps
}>({
  message: "",
  options: {},
})

export function useSnack() {
  function notify(message: string, options: VSnackbarProps = {}) {
    state.message = message
    state.options = options
  }

  function reset() {
    state.message = ""
    state.options = {}
  }

  return {
    ...toRefs(state),
    notify,
    reset,
  }
}

export default useSnack
