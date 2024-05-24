<template>
  <v-data-table-server
    v-model:items-per-page="itemsPerPage"
    v-model:page="page"
    :headers="headers"
    :items="datasetEntryPreviewsData"
    :items-length="totalCount"
    :items-per-page-options="itemsPerPageOptions"
    :loading="isLoadingDatasetFields || isLoadingDatasetEntryPreviews"
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
      </v-row>
    </template>
    <template
      v-if="isEmpty(headers) && !isEmpty(datasetEntryPreviewsData)"
      #body
    >
      <v-container>
        No data. Please enabled preview, and add at least one field that is not excluded from preview.
      </v-container>
    </template>
    <template
      v-else-if="isEmpty(datasetEntryPreviewsData)"
      #no-data
    >
      <v-container>
        No data. Please enable preview, and add some data to be able to see a preview.
      </v-container>
    </template>
  </v-data-table-server>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue"
import { debounce, isEmpty } from "lodash"

import { MAX_PER_PAGE } from "@/api/base-api"
import useDatasetFields from "@/use/use-dataset-fields"
import useDatasetEntryPreviews, { DatasetEntryPreview } from "@/use/use-dataset-entry-previews"

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

const datasetFieldsQuery = computed(() => ({
  where: {
    datasetId: props.datasetId,
    isExcludedFromPreview: false,
  },
  // TODO: figure out a better solution than using max page size
  // Using a paginated iterator for datasetFields would be pretty slick.
  perPage: MAX_PER_PAGE,
}))

const {
  datasetFields,
  isLoading: isLoadingDatasetFields,
  refresh: refreshDatasetFields,
} = useDatasetFields(datasetFieldsQuery)

const headers = computed(() => {
  return datasetFields.value.map((datasetField) => {
    return {
      title: datasetField.displayName,
      key: datasetField.name,
    }
  })
})

const datasetEntryPreviewsQuery = computed(() => ({
  where: {
    datasetId: props.datasetId,
  },
  filters: {
    search: searchToken.value,
  },
  perPage: itemsPerPage.value,
  page: page.value,
}))
const {
  datasetEntryPreviews,
  totalCount,
  isLoading: isLoadingDatasetEntryPreviews,
  refresh: refreshDatasetEntryPreviews,
} = useDatasetEntryPreviews(datasetEntryPreviewsQuery)

const datasetEntryPreviewsData = computed<DatasetEntryPreview["jsonData"][]>(() => {
  return datasetEntryPreviews.value.map(({ jsonData }) => {
    return jsonData
  })
})

function updateSearchToken(value: string) {
  searchToken.value = value
}

const debouncedUpdateSearchToken = debounce(updateSearchToken, 1000)

function refresh() {
  refreshDatasetFields()
  refreshDatasetEntryPreviews()
}

defineExpose({
  refresh,
})
</script>
