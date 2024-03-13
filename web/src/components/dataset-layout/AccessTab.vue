<template>
  <LockedTab
    v-if="locked || !isManaging"
    :tooltip-text="tooltipText"
    >Access</LockedTab
  >
  <v-tab
    v-else
    :to="{ name: 'DatasetAccessManagePage', params: { slug } }"
    ><h3>Access</h3></v-tab
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

const isManaging = computed(() => {
  switch (route.name) {
    case "DatasetDescriptionManagePage":
    case "DatasetFieldsManagePage":
    case "DatasetAccessManagePage":
    case "DatasetVisualizeManagePage":
      return true
    default:
      return false
  }
})

const tooltipText = computed<string | undefined>(() => {
  if (isManaging.value) return

  return "Cannot access this tab unless in edit mode."
})
</script>
