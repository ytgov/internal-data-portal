<template>
  TODO: build out dataset show page.

  <v-btn
    color="primary"
    :to="{
      name: 'DatasetDescriptionManagePage',
      params: { slug },
    }"
  >
    Edit
  </v-btn>

  <pre>{{ dataset }}</pre>
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

const { setBreadcrumbs } = useBreadcrumbs()

setBreadcrumbs([
  {
    title: "Dataset",
    to: {
      name: "DatasetPage",
      params: { slug: props.slug },
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

const { slug } = toRefs(props)
const { dataset } = useDataset(slug)
</script>
