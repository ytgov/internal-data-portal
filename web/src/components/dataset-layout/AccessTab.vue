<template>
  <v-tab
    v-if="isManaging"
    :to="{ name: 'DatasetAccessManagePage', params: { slug } }"
    ><h3>Access</h3></v-tab
  >
  <LockedTab
    v-else
    tooltip-text="Cannot access this tab unless in edit mode."
    >Access</LockedTab
  >
</template>

<script lang="ts" setup>
import LockedTab from "@/components/LockedTab.vue"

defineProps({
  slug: {
    type: String,
    required: true,
  },
  isManaging: {
    type: Boolean,
    default: false,
  },
})
</script>
