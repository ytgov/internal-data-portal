<template>
  <v-container>
    <div class="d-flex justify-space-between align-baseline mb-3">
      <h2 class="">All Users</h2>

      <v-btn
        color="primary"
        :to="{ name: 'UserNewPage' }"
      >
        Create User
      </v-btn>
    </div>

    <UsersEditTable />
  </v-container>
</template>

<script lang="ts" setup>
import UsersEditTable from "@/components/users/UsersEditTable.vue"

import { useBreadcrumbs } from "@/use/use-breadcrumbs"

const { setBreadcrumbs } = useBreadcrumbs()

setBreadcrumbs([
  {
    title: "All Users",
    to: { name: "UsersPage" },
  },
])
</script>
