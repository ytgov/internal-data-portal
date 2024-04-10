<template>
  <v-btn
    :loading="isLoading"
    icon="mdi-refresh"
    size="x-small"
    title="Refresh Dataset"
    @click="refresh"
  />
</template>

<script lang="ts" setup>
import { ref } from "vue"

import http from "@/api/http-client"
import useSnack from "@/use/use-snack"

const props = defineProps({
  datasetId: {
    type: Number,
    required: true,
  },
})

const emit = defineEmits<{
  completed: [void]
}>()

const snack = useSnack()
const isLoading = ref(false)

async function refresh() {
  isLoading.value = true
  try {
    await http.post(`/api/datasets/${props.datasetId}/refresh`)
    emit("completed")
    snack.notify("Dataset refreshed", {
      color: "success",
    })
  } catch (error) {
    console.error("Failed to refresh dataset", error)
    snack.notify("Failed to refresh dataset", {
      color: "error",
    })
  } finally {
    isLoading.value = false
  }
}
</script>
