<template>
  <v-card>
    <v-card-title> Access </v-card-title>
    <v-card-text>
      <v-skeleton-loader
        v-if="isNil(dataset)"
        type="table"
      />
      <AccessGrantsEditTable
        v-else
        :dataset-id="dataset.id"
      />
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { toRefs } from "vue"
import { isNil } from "lodash"

import useDataset from "@/use/use-dataset"

import AccessGrantsEditTable from "@/components/access-grants/AccessGrantsEditTable.vue"

const props = defineProps({
  slug: {
    type: String,
    required: true,
  },
})

const { slug } = toRefs(props)
const { dataset } = useDataset(slug)
</script>
