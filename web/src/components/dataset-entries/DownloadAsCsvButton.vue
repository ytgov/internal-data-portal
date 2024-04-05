<template>
  <form
    ref="form"
    :action="downloadUrl"
    method="post"
    target="_blank"
    @submit.prevent="getAccessTokenAndSubmit"
  >
    <input
      type="hidden"
      name="IDP_AUTHORIZATION_TOKEN"
      :value="accessToken"
    />
    <v-btn
      color="primary"
      type="submit"
    >
      Download to CSV
    </v-btn>
  </form>
</template>

<script lang="ts" setup>
import { computed, ref, nextTick } from "vue"
import { isNil } from "lodash"

import { useAuth0 } from "@auth0/auth0-vue"

import { API_BASE_URL } from "@/config"
import { stringifyQuery } from "@/api/base-api"

const props = defineProps({
  datasetId: {
    type: Number,
    required: true,
  },
  query: {
    type: Object,
    required: true,
  },
})

const { getAccessTokenSilently } = useAuth0()

const form = ref<HTMLFormElement | null>(null)
const accessToken = ref<string | null>(null)

const downloadUrl = computed(() => {
  const serializedParams = stringifyQuery(props.query)
  return `${API_BASE_URL}/datasets/${props.datasetId}/download.csv?${serializedParams}`
})

async function getAccessTokenAndSubmit() {
  if (isNil(form.value)) {
    throw new Error("Form element is not available")
  }

  try {
    accessToken.value = await getAccessTokenSilently()
  } catch (error) {
    console.error("Error fetching new access token:", error)
    throw error
  }

  await nextTick() // Wait for accessToken to be updated in the DOM

  form.value.submit()
}
</script>
