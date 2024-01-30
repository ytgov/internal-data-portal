<template>
  <v-container>
    <h2 class="mb-3">All Dataset</h2>

    <DatasetsTable />
  </v-container>
</template>

<script lang="ts" setup>
import DatasetsTable from "@/components/datasets/DatasetsTable.vue"

import { useBreadcrumbs } from "@/use/use-breadcrumbs"

const { setBreadcrumbs } = useBreadcrumbs()

setBreadcrumbs([
  {
    title: "All Dataset",
    to: { name: "DatasetsPage" },
  },
])
</script>
