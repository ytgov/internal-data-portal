<template>
  TODO: build DatasetVisualizeReadPage

  <v-progress-circular
      v-if="isNil(dataset) || isNil(policy)"
      indeterminate
      color="primary"
      size="36"
    />
    <v-btn
      v-else-if="policy.update"
      color="primary"
      :to="{
        name: 'DatasetVisualizeManagePage',
        params: { slug },
      }"
    >
      Edit
    </v-btn>
    <template v-else>
      <!-- user does not have edit rights for dataset fields -->
    </template>
</template>

<script setup lang="ts">
import { toRefs } from "vue"
import { isNil } from "lodash"

import { useBreadcrumbs } from "@/use/use-breadcrumbs"
import { useDataset } from "@/use/use-dataset"

const props = defineProps({
  slug: {
    type: String,
    required: true,
  },
})

const { slug } = toRefs(props)
const { dataset, policy } = useDataset(slug)

const { setBreadcrumbs } = useBreadcrumbs()

setBreadcrumbs([
  {
    title: "Datasets",
    to: {
      name: "DatasetsPage",
    },
  },
  {
    title: "Visualize",
    to: {
      name: "DatasetVisualizeReadPage",
      params: { slug: props.slug },
    },
  },
])
</script>
