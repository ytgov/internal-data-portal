<template>
  <DataDescriptionCard :slug="slug" />
</template>

<script setup lang="ts">
import { useBreadcrumbs } from "@/use/use-breadcrumbs"

import DataDescriptionCard from "@/components/datasets/DataDescriptionCard.vue"

const props = defineProps({
  slug: {
    type: String,
    required: true,
  },
})

const { setBreadcrumbs } = useBreadcrumbs()

setBreadcrumbs([
  {
    title: "Datasets",
    to: {
      name: "DatasetsPage",
    },
  },
  {
    title: "Description",
    to: {
      name: "DatasetDescriptionReadPage",
      params: { slug: props.slug },
    },
  },
])
</script>
