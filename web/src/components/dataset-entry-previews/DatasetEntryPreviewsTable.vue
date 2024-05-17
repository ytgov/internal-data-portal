<template>TODO: implement DatasetEntryPreviewsTable</template>

<script lang="ts" setup>
defineProps({
  datasetId: {
    type: Number,
    required: true,
  },
  visualizationControlId: {
    type: Number,
    required: true,
  },
})

function refresh() {
  console.log('TODO: implement refresh')
}

defineExpose({
  refresh,
})
</script>
