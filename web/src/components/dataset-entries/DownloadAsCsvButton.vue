<template>
  <form
    ref="form"
    :action="downloadUrl"
    method="post"
    target="_blank"
    @submit.prevent="getAccessTokenAndSubmit"
  >
    <v-btn
      color="primary"
      type="submit"
    >
      Download to CSV
    </v-btn>
  </form>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue"
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

const downloadUrl = computed(() => {
  const serializedParams = stringifyQuery(props.query)
  return `${API_BASE_URL}/datasets/${props.datasetId}/download.csv?${serializedParams}`
})

async function getAccessTokenAndSubmit() {
  if (isNil(form.value)) {
    throw new Error("Form element is not available")
  }

  let accessToken: string
  try {
    accessToken = await getAccessTokenSilently()
  } catch (error) {
    console.error("Error fetching new access token:", error)
    throw error
  }

  const accessTokenInput = await buildAccessTokenInput(accessToken)
  form.value.appendChild(accessTokenInput)

  form.value.submit()
}

async function buildAccessTokenInput(accessToken: string): Promise<HTMLInputElement> {
  const accessTokenInput = document.createElement("input")
  accessTokenInput.type = "hidden"
  accessTokenInput.name = "IDP_AUTHORIZATION_TOKEN"
  accessTokenInput.value = accessToken
  return accessTokenInput
}
</script>
