<template>
  <v-container>
    <h2 class="mb-6">Link External API</h2>

    <!-- TODO: make the skeleton loader an external component that matches the form -->
    <v-skeleton-loader
      v-if="isNil(dataset)"
      type="card"
    />
    <LinkExternalApiForm
      v-else
      :dataset-id="dataset.id"
    />
  </v-container>
</template>

<script lang="ts" setup>
import { toRefs } from "vue"
import { isNil } from "lodash"

import useBreadcrumbs from "@/use/use-breadcrumbs"
import useDataset from "@/use/use-dataset"

import LinkExternalApiForm from "@/components/dataset-integrations/DatasetIntegrationCreateForm.vue"

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
