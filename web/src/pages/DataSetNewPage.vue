<template>
  <v-container>
    <h2 class="mb-3">Create Dataset</h2>

    <NewDataSetForm />
  </v-container>
</template>

<script lang="ts" setup>
import NewDataSetForm from "@/components/data-sets/NewDataSetForm.vue"

import { useBreadcrumbs } from "@/use/use-breadcrumbs"

const { setBreadcrumbs } = useBreadcrumbs()

setBreadcrumbs([
  {
    title: "Create Dataset",
    to: { name: "DataSetNewPage" },
  },
])
</script>
