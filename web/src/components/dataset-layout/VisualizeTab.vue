<template>
  <v-tab :to="{ name: routeName, params: { slug } }"><h3>Visualize</h3></v-tab>
</template>

<script lang="ts" setup>
import { computed } from "vue"

const props = defineProps({
  slug: {
    type: String,
    required: true,
  },
  isManaging: {
    type: Boolean,
    default: false,
  },
})

const routeName = computed(() => {
  if (props.isManaging) return "DatasetVisualizeManagePage"

  return "DatasetVisualizeReadPage"
})
</script>
