<template>
  <v-container>
    <h2 class="mb-3">Create Dataset</h2>

    <NewDatasetForm />
  </v-container>
</template>

<script lang="ts" setup>
import NewDatasetForm from "@/components/datasets/NewDatasetForm.vue"

import { useBreadcrumbs } from "@/use/use-breadcrumbs"

const { setBreadcrumbs } = useBreadcrumbs()

setBreadcrumbs([
  {
    title: "Create Dataset",
    to: { name: "DatasetNewPage" },
  },
])
</script>
