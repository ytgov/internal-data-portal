<template>
  <v-container>
    <v-row>
      <v-col
        cols="0"
        md="3"
      ></v-col>
      <v-col
        cols="12"
        md="6"
      >
        <h2>Link External API</h2>
      </v-col>
    </v-row>

    <v-row>
      <v-col
        cols="0"
        md="3"
      ></v-col>
      <v-col
        cols="12"
        md="6"
      >
        <!-- TODO: make the skeleton loader an external component that matches the form -->
        <v-skeleton-loader
          v-if="isNil(dataset) || isNil(dataset.integration.id)"
          type="card"
        />
        <DatasetIntegrationUpdateForm
          v-else
          :dataset-id="dataset.id"
          :dataset-integration-id="dataset.integration.id"
          @completed="returnToParentPage"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts" setup>
import { toRefs } from "vue"
import { useRouter } from "vue-router"
import { isNil } from "lodash"

import useBreadcrumbs from "@/use/use-breadcrumbs"
import useDataset from "@/use/use-dataset"

import DatasetIntegrationUpdateForm from "@/components/dataset-integrations/DatasetIntegrationUpdateForm.vue"

const props = defineProps({
  slug: {
    type: String,
    required: true,
  },
})

const { slug } = toRefs(props)
const { dataset } = useDataset(slug)
const router = useRouter()

function returnToParentPage() {
  router.push({
    name: "DatasetDescriptionManagePage",
    params: { slug: props.slug },
  })
}

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
      name: "DatasetIntegrationManagePage",
      params: { slug: props.slug },
    },
  },
])
</script>
