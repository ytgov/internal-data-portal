<template>
  <v-container>
    <div class="d-flex justify-space-between align-baseline mb-3">
      <h2 class="">All Dataset</h2>

      <v-btn
        icon="mdi-cached"
        color="primary"
        variant="outlined"
        size="x-small"
        title="Refresh Datasets"
        @click="refresh"
      />
    </div>

    <DatasetsTable ref="datasetsTable" />
  </v-container>
</template>

<script lang="ts" setup>
import { ref } from "vue"

import DatasetsTable from "@/components/datasets/DatasetsTable.vue"

import { useBreadcrumbs } from "@/use/use-breadcrumbs"

const { setBreadcrumbs } = useBreadcrumbs()

const datasetsTable = ref<InstanceType<typeof DatasetsTable>>()

setBreadcrumbs([
  {
    title: "All Dataset",
    to: { name: "DatasetsPage" },
  },
])

function refresh() {
  datasetsTable.value?.refresh()
}
</script>
