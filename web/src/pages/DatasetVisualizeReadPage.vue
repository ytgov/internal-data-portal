<template>
  <div class="d-flex justify-end">
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
        name: 'DatasetVisualizeManagePage',
        params: { slug },
      }"
    >
      Edit
    </v-btn>
    <template v-else>
      <!-- user does not have edit rights for dataset fields -->
    </template>
  </div>

  <v-spacer class="mt-6"/>
  <v-skeleton-loader
    v-if="isNil(dataset)"
    type="table"
  />
  <DatasetEntriesTable
    v-else
    :dataset-id="dataset.id"
    :visualization-control-id="dataset.visualizationControl.id"
  />
</template>

<script setup lang="ts">
import { toRefs } from "vue"
import { isNil } from "lodash"

import { useBreadcrumbs } from "@/use/use-breadcrumbs"
import { useDataset } from "@/use/use-dataset"

import DatasetEntriesTable from "@/components/dataset-entries/DatasetEntriesTable.vue"

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
    title: "Visualize",
    to: {
      name: "DatasetVisualizeReadPage",
      params: { slug: props.slug },
    },
  },
])
</script>
