<template>
  <v-btn
    :loading="isLoading"
    color="primary"
    @click.prevent="setCookie"
    >Download to CSV</v-btn
  >
</template>

<script lang="ts" setup>
import { computed, ref } from "vue"
import { isNil } from "lodash"

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

async function setCookie() {
  isLoading.value = true
  try {
    const newTab = window.open("about:blank", "_blank")
    if (isNil(newTab)) {
      console.error("Popup was blocked or failed to open")
      snack.notify("Popup was blocked or failed to open. Please allow popups for this site", {
        color: "error",
      })
      return
    }

    newTab.document.write(`
      <html>
        <head>
          <title>Preparing Download</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; margin-top: 50px; }
            .loader { border: 16px solid #f3f3f3; border-radius: 50%; border-top: 16px solid #3498db; width: 120px; height: 120px; -webkit-animation: spin 2s linear infinite; animation: spin 2s linear infinite; margin: auto; }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            @-webkit-keyframes spin { 0% { -webkit-transform: rotate(0deg); } 100% { -webkit-transform: rotate(360deg); } }
          </style>
        </head>
        <body>
          <div class="loader"></div>
          <p>Preparing download access.<br />This tab will close automatically in 5 seconds.<br>Please do not close this tab.</p>
        </body>
      </html>
    `)

    await temporaryCookieAccessApi.create()

    newTab.location.href = downloadUrl.value

    setTimeout(() => {
      newTab.close()
    }, 5 * 1000)
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
