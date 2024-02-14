<template>
  TODO: build out dataset fields page.

  <v-btn
    color="primary"
    :to="{
      name: 'DatasetFieldsManagePage',
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

const { slug } = toRefs(props)
const { dataset } = useDataset(slug)
</script>
