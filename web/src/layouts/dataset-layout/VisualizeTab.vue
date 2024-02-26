<template>
  <LockedTab v-if="locked">Visualize</LockedTab>
  <v-tab
    v-else
    :to="{ name: 'DatasetVisualizeManagePage', params: { slug } }"
    ><h3>Visualize</h3></v-tab
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
