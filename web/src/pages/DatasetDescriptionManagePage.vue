<template>
  {{ slug }}
  <br />
  TODO: implement DatasetDescriptionManagePage

  <pre>{{ dataset }}</pre>
</template>

<script lang="ts" setup>
import { toRefs } from "vue"

import useBreadcrumbs from "@/use/use-breadcrumbs"
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
    to: { name: "DatasetPage" },
  },
  {
    title: "Description",
    to: { name: "DatasetDescriptionReadPage" },
  },
  {
    title: "Manage",
    to: { name: "DatasetDescriptionManagePage" },
  },
])

const { slug } = toRefs(props)
const { dataset } = useDataset(slug)
</script>
