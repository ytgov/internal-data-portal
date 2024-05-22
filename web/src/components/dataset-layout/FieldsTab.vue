<template>
  <v-tab :to="{ name: routeName, params: { slug } }"><h3>Fields</h3></v-tab>
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
  if (props.isManaging) return "DatasetFieldsManagePage"

  return "DatasetFieldsReadPage"
})
</script>
