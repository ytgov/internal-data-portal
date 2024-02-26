<template>
  <LockedTab v-if="locked">Access</LockedTab>
  <v-tab
    v-else
    :to="{ name: 'DatasetAccessManagePage', params: { slug } }"
    ><h3>Access</h3></v-tab
  >
</template>

<script lang="ts" setup>
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
</script>
