<template>
  TODO: build DatasetVisualizeManagePage

  {{ dataset }}
</template>

<script setup lang="ts">
import { toRefs } from "vue"

import { useBreadcrumbs } from "@/use/use-breadcrumbs"
import { useDataset } from "@/use/use-dataset"

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
