<template>
  <h2 class="mb-3">Create Dataset</h2>

  <DataDescriptionFormCard />

  <div class="d-flex justify-end mt-4">
    <v-btn
      color="success"
      @click="save"
      >Save</v-btn
    >
  </div>
</template>

<script lang="ts" setup>
import DataDescriptionFormCard from "@/components/data-sets/DataDescriptionFormCard.vue"

import { useBreadcrumbs } from "@/use/use-breadcrumbs"

const { setBreadcrumbs } = useBreadcrumbs()

setBreadcrumbs([
  {
    title: "Create Dataset",
    to: { name: "DataSetNewPage" },
  },
])

function save() {
  alert("TODO: will persist the dataset")
}
</script>
