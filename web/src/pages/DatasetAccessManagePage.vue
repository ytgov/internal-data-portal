<template>
  <v-row>
    <v-col
      cols="12"
      md="4"
    >
      <DataAccessFormCard :slug="slug" />
    </v-col>
    <v-col
      cols="12"
      md="8"
    >
      <AccessEditCard :slug="slug" />
    </v-col>
  </v-row>
  <v-row>
    <v-col cols="12">
      <v-skeleton-loader
        type="table"
        boilerplate
      />
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { useBreadcrumbs } from "@/use/use-breadcrumbs"

import DataAccessFormCard from "@/components/datasets/DataAccessFormCard.vue"
import AccessEditCard from "@/components/access-grants/AccessEditCard.vue"

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
    title: "Access",
    to: {
      name: "DatasetAccessManagePage",
      params: { slug: props.slug },
    },
  },
  {
    title: "Manage",
    to: {
      name: "DatasetAccessManagePage",
      params: { slug: props.slug },
    },
  },
])
</script>
