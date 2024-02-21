<template>
  <!-- TODO: lock tab when access request is required before viewing -->
  <v-tab :to="{ name: routeName, params: { slug } }"><h3>Fields</h3></v-tab>
</template>

<script lang="ts" setup>
import { computed } from "vue"
import { useRoute } from "vue-router"

defineProps({
  slug: {
    type: String,
    required: true,
  },
})

const route = useRoute()

// TODO: maybe vary route by user role?
const routeName = computed(() => {
  switch (route.name) {
    case "DatasetDescriptionManagePage":
    case "DatasetFieldsManagePage":
    case "DatasetAccessManagePage":
      return "DatasetFieldsManagePage"
    default:
      return "DatasetFieldsReadPage"
  }
})
</script>
