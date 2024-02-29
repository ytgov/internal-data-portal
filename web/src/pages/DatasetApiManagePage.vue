<template>
  <v-container>
    <h2 class="mb-6">Link External API</h2>

    <LinkExternalApiForm
      :slug="slug"
      class="mt-6"
    />
  </v-container>
</template>

<script lang="ts" setup>
import useBreadcrumbs from "@/use/use-breadcrumbs"

import LinkExternalApiForm from "@/components/datasets/LinkExternalApiForm.vue"

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
  {
    title: "Manage",
    to: {
      name: "DatasetDescriptionManagePage",
      params: { slug: props.slug },
    },
  },
  {
    title: "Link API",
    to: {
      name: "DatasetApiManagePage",
      params: { slug: props.slug },
    },
  },
])
</script>
