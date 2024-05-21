<template>
  <v-skeleton-loader
    v-if="isNil(dataset)"
    type="card"
  />
  <VisualizePropertiesFormCard
    v-else
    :visualization-control-id="dataset.visualizationControl.id"
    @saved="refreshTable"
  />

  <v-spacer class="mt-6" />
  <div class="d-flex justify-end">
    <v-switch
      v-model="showPreview"
      :label="showPreview ? 'Preview' : 'Full'"
      color="primary"
      inset
    />
  </div>
  <v-spacer class="mt-6" />
  <v-skeleton-loader
    v-if="isNil(dataset)"
    type="table"
  />
  <DatasetEntryPreviewsTable
    v-else-if="showPreview"
    ref="datasetEntryPreviewsTable"
    :dataset-id="dataset.id"
    :visualization-control-id="dataset.visualizationControl.id"
  />
  <DatasetEntriesTable
    v-else
    ref="datasetEntriesTable"
    :dataset-id="dataset.id"
    :visualization-control-id="dataset.visualizationControl.id"
  />
</template>

<script setup lang="ts">
import { ref, toRefs, watch } from "vue"
import { useRoute, useRouter } from "vue-router"
import { isNil } from "lodash"

import { useBreadcrumbs } from "@/use/use-breadcrumbs"
import { useDataset } from "@/use/use-dataset"

import DatasetEntryPreviewsTable from "@/components/dataset-entry-previews/DatasetEntryPreviewsTable.vue"
import DatasetEntriesTable from "@/components/dataset-entries/DatasetEntriesTable.vue"
import VisualizePropertiesFormCard from "@/components/visualization-controls/VisualizePropertiesFormCard.vue"

const props = defineProps({
  slug: {
    type: String,
    required: true,
  },
})

const { slug } = toRefs(props)
const { dataset } = useDataset(slug)

const route = useRoute()
const showPreview = ref(route.query.showPreview !== "false")

const datasetEntryPreviewsTable = ref<InstanceType<typeof DatasetEntryPreviewsTable> | null>(null)
const datasetEntriesTable = ref<InstanceType<typeof DatasetEntriesTable> | null>(null)

function refreshTable() {
  if (showPreview.value) {
    if (isNil(datasetEntryPreviewsTable.value)) {
      return
    }

    datasetEntryPreviewsTable.value.refresh()
    return
  }

  if (isNil(datasetEntriesTable.value)) {
    return
  }

  datasetEntriesTable.value.refresh()
}

const router = useRouter()

watch(
  () => showPreview.value,
  (value) => {
    if (value === false) {
      router.push({ query: { showPreview: "false" } })
    } else {
      router.push({ query: { showPreview: undefined } })
    }
  }
)

const { setBreadcrumbs } = useBreadcrumbs()

setBreadcrumbs([
  {
    title: "Datasets",
    to: {
      name: "DatasetsPage",
    },
  },
  {
    title: "Visualize",
    to: {
      name: "DatasetVisualizeReadPage",
      params: { slug: props.slug },
    },
  },
  {
    title: "Manage",
    to: {
      name: "DatasetVisualizeManagePage",
      params: { slug: props.slug },
    },
  },
])
</script>
