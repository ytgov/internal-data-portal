<template>
  {{ datasetId }}

  TODO: build out dataset show page.
</template>

<script setup lang="ts">
defineProps({
  datasetId: {
    type: Number,
    required: true,
  },
})
</script>
