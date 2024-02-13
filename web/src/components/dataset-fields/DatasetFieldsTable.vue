<template>
  <v-data-table
    v-model:items-per-page="itemsPerPage"
    v-model:page="page"
    :headers="headers"
    :items="datasetFields"
    :items-length="totalCount"
    :loading="isLoading"
    class="elevation-1"
  >
  </v-data-table>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue"

import useDatasetFields from "@/use/use-dataset-fields"

const props = defineProps({
  datasetId: {
    type: Number,
    required: true,
  },
})

const headers = ref([
  { title: "Field Name", key: "name" },
  { title: "Display Name", key: "displayName" },
  { title: "Field Description", key: "description" },
  { title: "Data Type", key: "dataType" },
  { title: "Notes", key: "note" },
  { title: "", key: "actions" },
])

const itemsPerPage = ref(10)
const page = ref(1)
const datasetsQuery = computed(() => ({
  where: {
    datasetId: props.datasetId,
  },
  perPage: itemsPerPage.value,
  page: page.value,
}))

const { datasetFields, totalCount, isLoading, refresh } = useDatasetFields(datasetsQuery)

defineExpose({ refresh })
</script>
