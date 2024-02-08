<template>
  <v-tab :to="{ name: routeName, params: { slug } }"><h3>Description</h3></v-tab>
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

// TODO: make this a bit more sensible and resilient
// maybe list all valid route names directly to avoid errors from dynamic calculation
const routeName = computed(() => {
  if (route.name.endsWith("ManagePage")) {
    return "DatasetDescriptionManagePage"
  } else {
    return "DatasetDescriptionReadPage"
  }
})
</script>
