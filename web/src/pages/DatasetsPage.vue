<template>
  <v-container>
    <h2 class="d-flex flex-column flex-md-row justify-space-between">
      All Dataset

      <v-btn
        class="mb-3"
        color="primary"
        :to="{ name: 'DatasetNewPage' }"
      >
        Add Dataset
      </v-btn>
    </h2>

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
