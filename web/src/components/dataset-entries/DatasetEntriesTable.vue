<template>
  <v-data-table-server
    v-model:items-per-page="itemsPerPage"
    v-model:page="page"
    :headers="headers"
    :items="datasetEntriesData"
    :items-length="totalCount"
    :items-per-page-options="itemsPerPageOptions"
    :loading="isLoadingDatasetFields || isLoadingDatasetEntries"
    class="elevation-1"
    loading-text="Loading... this might take a while"
  >
    <template #top>
      <v-row class="ma-1">
        <v-col
          cols="12"
          md="4"
        >
          <v-text-field
            :model-value="searchToken"
            prepend-inner-icon="mdi-magnify"
            label="Search"
            variant="outlined"
            hide-details
            @update:model-value="debouncedUpdateSearchToken"
          />
        </v-col>
        <v-col class="d-flex justify-end align-center">
          <DownloadAsCsvButton
            v-if="visualizationControl?.isDownloadableAsCsv"
            :query="datasetEntriesQuery"
          />
        </v-col>
      </v-row>
    </template>
    <!-- TODO: remove this once fields are auto-generated on dataset import -->
    <template
      v-if="isEmpty(headers) && !isEmpty(datasetEntriesData)"
      #tbody
    >
      <v-container>
        To display data in the table, please navigate to the 'Fields' tab and add the relevant
        fields. This step is necessary to visualize the data.
      </v-container>
    </template>
  </v-data-table-server>
</template>

<script lang="ts" setup>
import { computed, ref, toRefs } from "vue"
import { debounce, isEmpty } from "lodash"

import { MAX_PER_PAGE } from "@/api/base-api"
import useDatasetFields from "@/use/use-dataset-fields"
import useDatasetEntries, { DatasetEntry } from "@/use/use-dataset-entries"
import useVisualizationControl from "@/use/use-visualization-control"

import DownloadAsCsvButton from "@/components/dataset-entries/DownloadAsCsvButton.vue"

const props = defineProps({
  datasetId: {
    type: Number,
    required: true,
  },
  visualizationControlId: {
    type: Number,
    required: true,
  },
})

const searchToken = ref("")
const itemsPerPage = ref(5)
const page = ref(1)

const itemsPerPageOptions = [
  { value: 5, title: "5" },
  { value: 10, title: "10" },
  { value: 50, title: "50" },
  { value: 100, title: "100" },
  { value: -1, title: "$vuetify.dataFooter.itemsPerPageAll" },
]

const { visualizationControlId } = toRefs(props)
const { visualizationControl, refresh: refreshVisualizationControl } =
  useVisualizationControl(visualizationControlId)

const datasetFieldsQuery = computed(() => ({
  where: {
    datasetId: props.datasetId,
  },
  // TODO: figure out a better solution than using max page size
  // Using a paginated iterator for datasetFields would be pretty slick.
  perPage: MAX_PER_PAGE,
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
  searchToken: searchToken.value,
  perPage: itemsPerPage.value,
  page: page.value,
}))
const {
  datasetEntries,
  totalCount,
  isLoading: isLoadingDatasetEntries,
  refresh: refreshDatasetEntries,
} = useDatasetEntries(datasetEntriesQuery)

const datasetEntriesData = computed<DatasetEntry["jsonData"][]>(() => {
  return datasetEntries.value.map(({ jsonData }) => {
    return jsonData
  })
})

function updateSearchToken(value: string) {
  searchToken.value = value
}

const debouncedUpdateSearchToken = debounce(updateSearchToken, 1000)

function refresh() {
  refreshVisualizationControl()
  refreshDatasetEntries()
}

defineExpose({
  refresh,
})
</script>
