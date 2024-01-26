<template>
  TODO: build out dataset show page.

  <pre>{{ dataset }}</pre>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue"

import datasetsApi, { type DatasetDetailedResult } from "@/api/datasets-api"
import { useBreadcrumbs } from "@/use/use-breadcrumbs"
import useSnack from "@/use/use-snack"

const props = defineProps({
  datasetId: {
    type: Number,
    required: true,
  },
})

const { setBreadcrumbs } = useBreadcrumbs()

setBreadcrumbs([
  {
    title: "Dataset",
    to: { name: "DatasetShowPage" },
  },
])
const snack = useSnack()
const dataset = ref<DatasetDetailedResult>()

onMounted(async () => {
  try {
    const { dataset: newDataset } = await datasetsApi.get(props.datasetId)
    dataset.value = newDataset
  } catch (error) {
    console.log("Failed to get dataset:", error)
    snack.notify("Failed to get dataset", { color: "error" })
  }
})
</script>
