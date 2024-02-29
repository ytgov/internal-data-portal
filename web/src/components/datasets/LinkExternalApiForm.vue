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
          Test Integration
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
          variant="outlined"
          readonly
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col
        cols="12"
        md="6"
      >
        <v-text-field
          v-model="externalApiJmesPathParsingExpression"
          label="JMESPath Parsing Expression"
          placeholder="e.g. divisions"
          variant="outlined"
        >
          <template #details>
            See
            <a
              class="mx-1"
              href="https://jmespath.org/"
              target="_blank"
              rel="noopener noreferrer"
              >JMESPath</a
            >
            for more information.
          </template>
        </v-text-field>
      </v-col>
    </v-row>
    <v-row>
      <v-col
        cols="12"
        md="6"
      >
        <h3>API Parsed Result Preview</h3>
        <v-textarea
          :model-value="apiParsedResultPreview"
          hint="Result must be an array for API to integrate correctly."
          rows="10"
          variant="outlined"
          readonly
          persistent-hint
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
import { computed, ref, toRefs } from "vue"
import { isEmpty, isNil } from "lodash"
import jmespath from "jmespath"

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
const externalApiJmesPathParsingExpression = ref<string | null>(null)

const apiParsedResultPreview = computed(() => {
  if (
    isNil(apiResultPreview.value) ||
    isEmpty(apiResultPreview.value) ||
    isNil(externalApiJmesPathParsingExpression.value) ||
    isEmpty(externalApiJmesPathParsingExpression.value)
  ) {
    return null
  }

  try {
    const parsedResult = jmespath.search(
      JSON.parse(apiResultPreview.value),
      externalApiJmesPathParsingExpression.value
    )
    return JSON.stringify(parsedResult, null, 2)
  } catch (error) {
    return JSON.stringify(error, null, 2)
  }
})

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
