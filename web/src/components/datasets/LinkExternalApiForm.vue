<template>
  <!-- TODO: make the skeleton loader an external component that matches the form -->
  <v-skeleton-loader
    v-if="isNil(dataset)"
    type="card"
  />
  <v-form
    v-else
    @submit.prevent="saveAndReturn"
  >
    <v-row>
      <v-col
        cols="12"
        md="6"
      >
        <v-text-field
          v-model="dataset.externalApiUrl"
          label="API Link"
          variant="outlined"
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col
        cols="12"
        md="6"
      >
        <v-text-field
          v-model="dataset.externalApiHeaderKey"
          label="Header Key"
          variant="outlined"
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col
        cols="12"
        md="6"
      >
        <PasswordTextField
          v-model="dataset.externalApiHeaderValue"
          label="Header Value"
          placeholder="Enter your access token"
          variant="outlined"
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col
        cols="12"
        md="6"
      >
        <v-btn
          color="primary"
          @click="fetchApiResults"
        >
          Test API
        </v-btn>
      </v-col>
    </v-row>
    <v-row>
      <v-col
        cols="12"
        md="6"
      >
        <h3>API Result Preview</h3>
        <v-textarea
          :model-value="apiResultPreview"
          rows="10"
          readonly
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col
        cols="12"
        md="6"
      >
        <v-btn
          color="primary"
          type="submit"
          variant="outlined"
        >
          Save and Return
        </v-btn>
      </v-col>
    </v-row>
  </v-form>
</template>

<script lang="ts" setup>
import { ref, toRefs } from "vue"
import { isNil } from "lodash"

import http from "@/api/http-client"
import useDataset from "@/use/use-dataset"

import PasswordTextField from "@/components/PasswordTextField.vue"

const props = defineProps({
  slug: {
    type: String,
    required: true,
  },
})

const { slug } = toRefs(props)
const { dataset } = useDataset(slug)

const apiResultPreview = ref<string | null>(null)

// TODO: save and send to back-end, have back end fetch results and return
// to bypass CORS issues
async function fetchApiResults() {
  if (isNil(dataset.value)) {
    throw new Error("Dataset is not loaded")
  }

  const { externalApiUrl, externalApiHeaderKey, externalApiHeaderValue } = dataset.value

  if (isNil(externalApiUrl)) {
    throw new Error("API Link is required")
  }

  if (isNil(externalApiHeaderKey)) {
    throw new Error("Header Key is required")
  }

  console.log(`externalApiUrl:`, externalApiUrl)
  console.log(`externalApiHeaderKey:`, externalApiHeaderKey)
  console.log(`externalApiHeaderValue:`, externalApiHeaderValue)
  try {
    const { data } = await http.post("/api/preview", {
      externalApiUrl,
      externalApiHeaderKey,
      externalApiHeaderValue,
    })
    apiResultPreview.value = JSON.stringify(data, null, 2)
  } catch (error) {
    apiResultPreview.value = JSON.stringify(error, null, 2)
  }
}

function saveAndReturn() {
  alert("TODO: return to dataset description manage page")
}
</script>
