<template>
  <div
    v-if="isNil(dataset) || isLoading"
    class="d-flex justify-center"
  >
    <v-progress-circular
      indeterminate
      color="yg-blue"
    />
  </div>
  <v-container v-else class="px-0 px-md-4">
    <h2 class="mb-3">
      {{ dataset.name }}
    </h2>

    <v-tabs>
      <DescriptionTab :slug="slug" />
      <!-- TODO: add in further tabs -->
    </v-tabs>

    <router-view></router-view>
  </v-container>
</template>

<script lang="ts" setup>
import { toRefs } from "vue"
import { isNil } from "lodash"

import { useDataset } from "@/use/use-dataset"

import DescriptionTab from "@/layouts/dataset-layout/DescriptionTab.vue"

const props = defineProps({
  slug: {
    type: String,
    required: true,
  },
})

const { slug } = toRefs(props)
const { dataset, isLoading } = useDataset(slug)
</script>
