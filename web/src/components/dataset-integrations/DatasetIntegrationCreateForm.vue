<template>
  <v-form @submit.prevent="saveAndReturn">
    <v-row>
      <v-col
        cols="12"
        md="6"
      >
        <v-text-field
          v-model="datasetIntegration.url"
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
          v-model="datasetIntegration.headerKey"
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
          v-model="datasetIntegration.headerValue"
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
          :model-value="datasetIntegration.rawJsonData"
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
          v-model="datasetIntegration.jmesPathTransform"
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
          :model-value="datasetIntegration.parsedJsonData"
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
import { ref } from "vue"
import { isEmpty, isNil } from "lodash"
import jmespath from "jmespath"

import datasetIntegrationsApi, { DatasetIntegration } from "@/api/dataset-integrations-api"

import PasswordTextField from "@/components/PasswordTextField.vue"
import { watch } from "vue"

const props = defineProps({
  datasetId: {
    type: Number,
    required: true,
  },
})

const datasetIntegration = ref<Partial<DatasetIntegration>>({
  datasetId: props.datasetId,
})

watch(
  () => props.datasetId,
  (newDatasetId) => {
    datasetIntegration.value.datasetId = newDatasetId
  }
)

watch(
  () => [datasetIntegration.value.rawJsonData, datasetIntegration.value.jmesPathTransform],
  () => {
    if (
      isNil(datasetIntegration.value.rawJsonData) ||
      isEmpty(datasetIntegration.value.rawJsonData) ||
      isNil(datasetIntegration.value.jmesPathTransform) ||
      isEmpty(datasetIntegration.value.jmesPathTransform)
    ) {
      return null
    }

    try {
      const rawJsonDataAsJson = JSON.parse(datasetIntegration.value.rawJsonData)
      const parsedResult = jmespath.search(
        rawJsonDataAsJson,
        datasetIntegration.value.jmesPathTransform
      )
      datasetIntegration.value.parsedJsonData = JSON.stringify(parsedResult, null, 2)
    } catch (error) {
      datasetIntegration.value.parsedJsonData = JSON.stringify(error, null, 2)
    }
  }
)

// TODO: save and send to back-end, have back end fetch results and return
// to bypass CORS issues
async function fetchApiResults() {
  if (isNil(datasetIntegration.value)) {
    throw new Error("Dataset is not loaded")
  }

  const { url, headerKey, headerValue } = datasetIntegration.value

  if (isNil(url)) {
    throw new Error("API Link is required")
  }

  if (isNil(headerKey)) {
    throw new Error("Header Key is required")
  }

  if (isNil(headerValue)) {
    throw new Error("Header Value is required")
  }

  try {
    const data = await datasetIntegrationsApi.preview(url, headerKey, headerValue)
    datasetIntegration.value.rawJsonData = JSON.stringify(data, null, 2)
  } catch (error) {
    datasetIntegration.value.rawJsonData = JSON.stringify(error, null, 2)
  }
}

function saveAndReturn() {
  alert("TODO: return to dataset description manage page")
}
</script>
