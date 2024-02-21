<template>
  <v-btn
    color="primary"
    variant="outlined"
    :to="{
      name: 'DatasetDescriptionReadPage',
      params: { slug },
      query: { showCreateRequest: 'true' },
    }"
  >
    Subscribe
  </v-btn>
</template>

<script lang="ts" setup>
defineProps<{ slug: string }>()
</script>
