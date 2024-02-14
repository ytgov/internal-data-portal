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
  <v-container
    v-else
    class="px-0 px-md-4"
  >
    <h2 class="mb-3">
      {{ dataset.name }}
    </h2>

    <v-tabs>
      <DescriptionTab :slug="slug" />
      <FieldsTab :slug="slug" />
      <AccessTab
        v-if="showAccessTab"
        :slug="slug"
      />
      <!-- TODO: add in further tabs -->
    </v-tabs>

    <router-view></router-view>
  </v-container>
</template>

<script lang="ts" setup>
import { computed, toRefs } from "vue"
import { useRoute } from "vue-router"
import { isNil } from "lodash"

import { useDataset } from "@/use/use-dataset"

import DescriptionTab from "@/layouts/dataset-layout/DescriptionTab.vue"
import FieldsTab from "@/layouts/dataset-layout/FieldsTab.vue"
import AccessTab from "@/layouts/dataset-layout/AccessTab.vue"

const props = defineProps({
  slug: {
    type: String,
    required: true,
  },
})

const { slug } = toRefs(props)
const { dataset, isLoading } = useDataset(slug)

const route = useRoute()

const showAccessTab = computed(() => {
  if (
    ["DatasetDescriptionManagePage", "DatasetFieldsManagePage", "DatasetAccessManagePage"].includes(
      route.name as string
    )
  ) {
    return true
  }

  return false
})
</script>
