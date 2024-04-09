<template>
  <v-form v-model="isValid">
    <v-row>
      <v-col>
        <v-text-field
          v-model="datasetIntegration.url"
          label="API Link *"
          :rules="[required]"
          variant="outlined"
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-text-field
          v-model="datasetIntegration.headerKey"
          label="Header Key"
          variant="outlined"
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <PasswordTextField
          v-model="datasetIntegration.headerValue"
          label="Header Value"
          placeholder="Enter your access token"
          variant="outlined"
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col class="d-flex justify-end">
        <v-btn
          :loading="isLoading"
          variant="outlined"
          color="primary"
          @click="updateDatasetIntegration({ skipDataProcessing: true })"
        >
          Update Preview
        </v-btn>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-textarea
          :model-value="prettifiedRawJsonData"
          label="API Result Preview"
          hint="This result has been truncted for display purposes."
          append-inner-icon="mdi-lock"
          rows="10"
          variant="outlined"
          readonly
          persistent-hint
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-text-field
          v-model="datasetIntegration.jmesPathTransform"
          label="JMESPath Parsing Expression"
          placeholder="e.g. divisions"
          variant="outlined"
        >
          <template #details>
            <span>
              See
              <a
                class="mx-1"
                href="https://jmespath.org/"
                target="_blank"
                rel="noopener noreferrer"
                >JMESPath</a
              >
              for more information.
            </span>
          </template>
        </v-text-field>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-textarea
          :model-value="prettifiedParsedJsonData"
          :rules="[required, parsesToArray]"
          label="API Parsed Result Preview *"
          hint="Result must be an array for API to integrate correctly."
          append-inner-icon="mdi-lock"
          rows="10"
          variant="outlined"
          readonly
          required
          persistent-hint
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col class="d-flex justify-end">
        <v-btn
          :loading="isLoading"
          color="primary"
          @click="updateAndCompleteIntegration"
        >
          Import Dataset and Return
        </v-btn>
      </v-col>
    </v-row>
  </v-form>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from "vue"
import { isEmpty, isNil, pick } from "lodash"
import jmespath from "jmespath"

import { required } from "@/utils/validators"
import datasetIntegrationsApi, { DatasetIntegration } from "@/api/dataset-integrations-api"
import useSnack from "@/use/use-snack"

import PasswordTextField from "@/components/PasswordTextField.vue"

const props = defineProps({
  datasetIntegrationId: {
    type: Number,
    default: null,
  },
})

const emit = defineEmits(["completed"])

const snack = useSnack()

const isLoading = ref(false)
const isValid = ref(false)
const datasetIntegration = ref<Partial<DatasetIntegration>>({})

const parsesToArray = (value: string) => {
  try {
    const parsedValue = JSON.parse(value)
    return Array.isArray(parsedValue) || "Must be a valid JSON array"
  } catch (error) {
    return "Must be a valid JSON array"
  }
}

const prettifiedRawJsonData = computed(() => {
  if (isNil(datasetIntegration.value.rawJsonData)) {
    return ""
  }

  try {
    return JSON.stringify(datasetIntegration.value.rawJsonData, null, 2)
  } catch (error) {
    return JSON.stringify(error, null, 2)
  }
})
const prettifiedParsedJsonData = computed(() => {
  if (isNil(datasetIntegration.value.parsedJsonData)) {
    return ""
  }

  try {
    return JSON.stringify(datasetIntegration.value.parsedJsonData, null, 2)
  } catch (error) {
    return JSON.stringify(error, null, 2)
  }
})

watch(
  () => props.datasetIntegrationId,
  async (newDatasetIntegrationId) => {
    if (isNil(newDatasetIntegrationId)) {
      return
    }

    await fetchDatasetIntegration()
  },
  { immediate: true }
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
      // @ts-expect-error - I'm passing an invalid type for convenience
      datasetIntegration.value.parsedJsonData = datasetIntegration.value.rawJsonData
      return
    }

    try {
      const parsedResult = jmespath.search(
        datasetIntegration.value.rawJsonData,
        datasetIntegration.value.jmesPathTransform
      )
      datasetIntegration.value.parsedJsonData = parsedResult
    } catch (error) {
      console.error("Failed to search JSON data:", error)
    }
  }
)

async function fetchDatasetIntegration() {
  if (isNil(props.datasetIntegrationId)) {
    throw new Error("id is required")
  }

  isLoading.value = true
  try {
    const { datasetIntegration: newDatasetIntegration } = await datasetIntegrationsApi.get(
      props.datasetIntegrationId
    )
    datasetIntegration.value = newDatasetIntegration
  } catch (error) {
    console.error("Failed to fetch dataset integration:", error)
    throw error
  } finally {
    isLoading.value = false
  }
}

function updateAndCompleteIntegration() {
  updateDatasetIntegration()
  emit("completed")
}

async function updateDatasetIntegration({
  skipDataProcessing = false,
}: { skipDataProcessing?: boolean } = {}) {
  if (!isValid.value) {
    snack.notify("Please fill out all required fields", {
      color: "error",
    })
    return
  }

  const datasetIntegrationId = datasetIntegration.value.id
  if (isNil(datasetIntegrationId)) {
    snack.notify("Please create the dataset integration first", {
      color: "error",
    })
    return
  }

  isLoading.value = true
  const attributes = pick(datasetIntegration.value, [
    "url",
    "headerKey",
    "headerValue",
    "jmesPathTransform",
  ])
  try {
    const { datasetIntegration: newDatasetIntegration } = await datasetIntegrationsApi.update(
      datasetIntegrationId,
      attributes,
      { skipDataProcessing }
    )
    datasetIntegration.value = newDatasetIntegration
    snack.notify("Dataset integration saved!", {
      color: "success",
    })
  } catch (error) {
    snack.notify(`Error saving dataset integration: ${error}`, {
      color: "error",
    })
  } finally {
    isLoading.value = false
  }
}
</script>
