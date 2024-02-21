<template>
  <DataDescriptionCard :slug="slug" />

  <v-row class="mt-4">
    <v-col
      cols="12"
      md="6"
    >
      <OwnerCard :slug="slug" />
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { useBreadcrumbs } from "@/use/use-breadcrumbs"

import DataDescriptionCard from "@/components/datasets/DataDescriptionCard.vue"
import OwnerCard from "@/components/datasets/OwnerCard.vue"

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
