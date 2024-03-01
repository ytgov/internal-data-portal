<template>
  <v-data-table-server
    v-model:items-per-page="itemsPerPage"
    v-model:page="page"
    :headers="headers"
    :items="datasetEntriesData"
    :items-length="totalCount"
    :loading="isLoadingDatasetFields || isLoadingDatasetEntries"
    class="elevation-1"
    loading-text="Loading... this might take a while"
  >
  </v-data-table-server>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue"

import useDatasetFields from "@/use/use-dataset-fields"
import useDatasetEntries, { DatasetEntry } from "@/use/use-dataset-entries"

const props = defineProps({
  datasetId: {
    type: Number,
    required: true,
  },
})

const itemsPerPage = ref(10)
const page = ref(1)

const datasetFieldsQuery = computed(() => ({
  where: {
    datasetId: props.datasetId,
  },
  // TODO: figure out a better solution than using max page size
  perPage: 1000, // max page size
}))

const { datasetFields, isLoading: isLoadingDatasetFields } = useDatasetFields(datasetFieldsQuery)

const headers = computed(() => {
  return datasetFields.value.map((datasetField) => {
    return {
      title: datasetField.displayName,
      key: datasetField.name,
    }
  })
})

const datasetEntriesQuery = computed(() => ({
  where: {
    datasetId: props.datasetId,
  },
  perPage: itemsPerPage.value,
  page: page.value,
}))
const {
  datasetEntries,
  totalCount,
  isLoading: isLoadingDatasetEntries,
} = useDatasetEntries(datasetEntriesQuery)

const datasetEntriesData = computed<DatasetEntry["jsonData"][]>(() => {
  return datasetEntries.value.map(({ jsonData }) => {
    return jsonData
  })
})
</script>
