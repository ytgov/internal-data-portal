<template>
  <v-data-table-server
    v-model:items-per-page="itemsPerPage"
    v-model:page="page"
    :headers="headers"
    :items="datasetFields"
    :items-length="totalCount"
    :loading="isLoading"
    class="elevation-1"
  >
  </v-data-table-server>
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
])

const itemsPerPage = ref(10)
const page = ref(1)
const datasetFieldsQuery = computed(() => ({
  where: {
    datasetId: props.datasetId,
  },
  perPage: itemsPerPage.value,
  page: page.value,
}))

const { datasetFields, totalCount, isLoading } = useDatasetFields(datasetFieldsQuery)
</script>
