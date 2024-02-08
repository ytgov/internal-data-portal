<template>
  <v-tab :to="{ name: routeName }"><h3>Description</h3></v-tab>
</template>

<script lang="ts" setup>
import { computed } from "vue"
import { useRoute } from "vue-router"

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
