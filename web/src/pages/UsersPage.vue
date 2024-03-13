<template>
  <v-container>
    <div class="d-flex justify-space-between align-baseline mb-3">
      <h2 class="">All Users</h2>

      <v-btn
        icon="mdi-cached"
        color="primary"
        variant="outlined"
        size="x-small"
        title="Refresh Datasets"
        @click="refresh"
      />
    </div>

    <UsersEditTable ref="usersEditsTable" />
  </v-container>
</template>

<script lang="ts" setup>
import { ref } from "vue"

import UsersEditTable from "@/components/users/UsersEditTable.vue"

import { useBreadcrumbs } from "@/use/use-breadcrumbs"

const { setBreadcrumbs } = useBreadcrumbs()

const usersEditsTable = ref<InstanceType<typeof UsersEditTable>>()

setBreadcrumbs([
  {
    title: "All Users",
    to: { name: "UsersPage" },
  },
])

function refresh() {
  usersEditsTable.value?.refresh()
}
</script>
