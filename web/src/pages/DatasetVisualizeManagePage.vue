<template>
  <v-skeleton-loader
    v-if="isNil(dataset)"
    type="card"
  />
  <VisualizePropertiesFormCard
    v-else
    :visualization-control-id="dataset.visualizationControl.id"
  />

  TODO: Add DatasetEntriesCard
</template>

<script setup lang="ts">
import { toRefs } from "vue"
import { isNil } from "lodash"

import { useBreadcrumbs } from "@/use/use-breadcrumbs"
import { useDataset } from "@/use/use-dataset"

import VisualizePropertiesFormCard from "@/components/visualization-controls/VisualizePropertiesFormCard.vue"

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
