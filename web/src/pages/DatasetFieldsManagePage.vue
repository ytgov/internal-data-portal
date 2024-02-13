<template>
  <h4>Fields</h4>

  <v-skeleton-loader
    v-if="isNil(dataset)"
    class="mt-6"
    type="table"
  />
  <DatasetFieldsTable
    v-else
    :dataset-id="dataset.id"
    class="mt-6"
  />
</template>

<script setup lang="ts">
import { toRefs } from "vue"
import { isNil } from "lodash"

import { useBreadcrumbs } from "@/use/use-breadcrumbs"
import { useDataset } from "@/use/use-dataset"

import DatasetFieldsTable from "@/components/dataset-fields/DatasetFieldsTable.vue"

const props = defineProps({
  slug: {
    type: String,
    required: true,
  },
})

const { slug } = toRefs(props)
const { dataset } = useDataset(slug)

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
