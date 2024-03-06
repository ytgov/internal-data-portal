<template>
  <v-btn
    :loading="isLoading"
    color="primary"
    @click="getAccessThenDownload"
    >Download to CSV</v-btn
  >
</template>

<script lang="ts" setup>
import { computed, ref } from "vue"

import { API_BASE_URL } from "@/config"
import { paramsSerializer } from "@/api/base-api"
import temporaryCookieAccessApi from "@/api/temporary-cookie-access-api"
import useSnack from "@/use/use-snack"

const props = defineProps({
  query: {
    type: Object,
    required: true,
  },
})

const snack = useSnack()

const isLoading = ref(false)

const downloadUrl = computed(() => {
  const serializedParams = paramsSerializer(props.query)
  return `${API_BASE_URL}/api/dataset-entries.csv?${serializedParams}`
})

const fileName = computed(() => {
  const date = new Date().toISOString().slice(0, 10)
  return `Data, Dataset Entries, ${date}.csv`
})

async function getAccessThenDownload() {
  isLoading.value = true
  try {
    const link = document.createElement("a")
    link.href = downloadUrl.value
    link.target = "_blank"
    link.download = fileName.value
    document.body.appendChild(link)

    await temporaryCookieAccessApi.create()

    link.click()
    document.body.removeChild(link)
  } catch (error) {
    console.error("Error fetching the CSV:", error)
    snack.notify("Error fetching csv. Please try again.", {
      color: "error",
    })
  } finally {
    isLoading.value = false
  }
}
</script>
