import { reactive, toRefs } from "vue"

export interface Breadcrumb {
  title: string
  disabled?: boolean
  to: {
    name: string
  }
}

const BASE_CRUMB = {
  title: "DataPortal",
  disabled: false,
  to: {
    name: "DashboardPage",
  },
}

// Global state for breadcrumbs
const state = reactive<{
  breadcrumbs: Breadcrumb[]
}>({
  breadcrumbs: [],
})

export function useBreadcrumbs() {
  function setBreadcrumbs(breadcrumbs: Breadcrumb[]) {
    state.breadcrumbs = [BASE_CRUMB, ...breadcrumbs]
  }

  return {
    ...toRefs(state),
    setBreadcrumbs
  }
}

export default useBreadcrumbs
