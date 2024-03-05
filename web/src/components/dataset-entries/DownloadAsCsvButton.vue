<template>
  <v-btn
    color="primary"
    @click.prevent="setCookie"
    >Download to CSV</v-btn
  >
</template>

<script lang="ts" setup>
import { computed } from "vue"

import { API_BASE_URL } from "@/config"
import { paramsSerializer } from "@/api/base-api"
import http from "@/api/http-client"

const props = defineProps({
  query: {
    type: Object,
    required: true,
  },
})

const downloadUrl = computed(() => {
  const serializedParams = paramsSerializer(props.query)
  return `${API_BASE_URL}/api/dataset-entries.csv?${serializedParams}`
})

async function setCookie() {
  try {
    await http.post("/api/temporary-access-cookie", undefined, {
      withCredentials: true,
    })

    window.open(downloadUrl.value, "_blank")
  } catch (error) {
    console.error("Error fetching the CSV:", error)
  }
}
</script>
