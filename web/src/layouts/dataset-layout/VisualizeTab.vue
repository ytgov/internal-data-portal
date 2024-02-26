<template>
  <LockedTab v-if="locked">Visualize</LockedTab>
  <v-tab
    v-else
    :to="{ name: routeName, params: { slug } }"
    ><h3>Visualize</h3></v-tab
  >
</template>

<script lang="ts" setup>
import { computed } from "vue"
import { useRoute } from "vue-router"

import LockedTab from "@/components/LockedTab.vue"

defineProps({
  slug: {
    type: String,
    required: true,
  },
  locked: {
    type: Boolean,
    default: false,
  },
})

const route = useRoute()

// TODO: maybe vary route by user role?
const routeName = computed(() => {
  switch (route.name) {
    case "DatasetDescriptionManagePage":
    case "DatasetFieldsManagePage":
    case "DatasetAccessManagePage":
    case "DatasetVisualizeManagePage":
      return "DatasetVisualizeManagePage"
    default:
      return "DatasetVisualizeReadPage"
  }
})
</script>
