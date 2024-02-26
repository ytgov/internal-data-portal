<template>
  <h4 class="d-flex justify-space-between align-end text-h4 mt-4">
    Fields

    <v-progress-circular
      v-if="isNil(dataset) || isNil(policy)"
      indeterminate
      color="primary"
      size="36"
    />
    <v-btn
      v-else-if="policy.update"
      color="primary"
      :to="{
        name: 'DatasetFieldsManagePage',
        params: { slug },
      }"
    >
      Edit
    </v-btn>
    <template v-else>
      <!-- user does not have edit rights for dataset fields -->
    </template>
  </h4>

  <v-skeleton-loader
    v-if="isNil(dataset)"
    class="mt-6"
    type="table"
  />
  <DatasetFieldsTable
    v-else
    ref="datasetFieldsTable"
    :dataset-id="dataset.id"
    class="mt-6"
  />
</template>

<script setup lang="ts">
import { toRefs } from "vue"
import { isNil } from "lodash"

import useBreadcrumbs from "@/use/use-breadcrumbs"
import useDataset from "@/use/use-dataset"

import DatasetFieldsTable from "@/components/dataset-fields/DatasetFieldsTable.vue"

const props = defineProps({
  slug: {
    type: String,
    required: true,
  },
})

const { slug } = toRefs(props)
const { dataset, policy } = useDataset(slug)

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
])
</script>
