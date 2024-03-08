<template>
  <v-container>
    <component :is="dashboardComponent" />
  </v-container>
</template>

<script lang="ts" setup>
import { computed, defineAsyncComponent } from "vue"

import useBreadcrumbs from "@/use/use-breadcrumbs"
import useCurrentUser, { RoleTypes } from "@/use/use-current-user"

const SystemAdminDashboard = defineAsyncComponent(
  () => import("@/components/dashboards/SystemAdminDashboard.vue")
)
const DataOwnerDashboard = defineAsyncComponent(
  () => import("@/components/dashboards/DataOwnerDashboard.vue")
)
const UserDashboard = defineAsyncComponent(
  () => import("@/components/dashboards/UserDashboard.vue")
)

const { currentUser } = useCurrentUser()

const dashboardComponent = computed(() => {
  if (currentUser.value?.roleTypes.includes(RoleTypes.SYSTEM_ADMIN)) {
    return SystemAdminDashboard
  }

  if (
    currentUser.value?.roleTypes.includes(RoleTypes.BUSINESS_ANALYST) ||
    currentUser.value?.roleTypes.includes(RoleTypes.DATA_OWNER)
  ) {
    return DataOwnerDashboard
  }

  return UserDashboard
})

const { setBreadcrumbs } = useBreadcrumbs()

setBreadcrumbs([
  {
    title: "Dashboard",
    to: { name: "DashboardPage" },
  },
])
</script>
