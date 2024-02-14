<template>
  <v-tab :to="{ name: 'DatasetAccessManagePage', params: { slug } }"><h3>Access</h3></v-tab>
</template>

<script lang="ts" setup>
defineProps({
  slug: {
    type: String,
    required: true,
  },
})
</script>
