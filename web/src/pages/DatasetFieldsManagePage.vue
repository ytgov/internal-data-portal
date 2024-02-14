<template>
  <h4 class="d-flex justify-space-between align-end text-h4 mt-4">
    Fields

    <v-skeleton-loader
      v-if="isNil(dataset)"
      type="button"
    />
    <DatasetFieldCreateDialog
      v-else
      :dataset-id="dataset.id"
      @created="refreshTable"
    />
  </h4>

  <v-skeleton-loader
    v-if="isNil(dataset)"
    class="mt-6"
    type="table"
  />
  <DatasetFieldsEditTable
    v-else
    ref="datasetFieldsTable"
    :dataset-id="dataset.id"
    class="mt-6"
  />
</template>

<script setup lang="ts">
import { ref, toRefs } from "vue"
import { isNil } from "lodash"

import { useBreadcrumbs } from "@/use/use-breadcrumbs"
import { useDataset } from "@/use/use-dataset"

import DatasetFieldsEditTable from "@/components/dataset-fields/DatasetFieldsEditTable.vue"
import DatasetFieldCreateDialog from "@/components/dataset-fields/DatasetFieldCreateDialog.vue"

const props = defineProps({
  slug: {
    type: String,
    required: true,
  },
})

const { slug } = toRefs(props)
const { dataset } = useDataset(slug)

const datasetFieldsTable = ref<InstanceType<typeof DatasetFieldsEditTable> | null>(null)

function refreshTable() {
  datasetFieldsTable.value?.refresh()
}

const { setBreadcrumbs } = useBreadcrumbs()

setBreadcrumbs([
  {
    title: "Datasets",
    to: {
      name: "DatasetsPage",
    },
  },
  {
    title: "Fields",
    to: {
      name: "DatasetFieldsReadPage",
      params: { slug: props.slug },
    },
  },
  {
    title: "Manage",
    to: {
      name: "DatasetFieldsManagePage",
      params: { slug: props.slug },
    },
  },
])
</script>
