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
          :variant="isPersisted ? 'outlined' : 'elevated'"
          :loading="isLoading"
          color="primary"
          @click="createOrUpdateIntegration"
        >
          {{ isPersisted ? "Update and Review" : "Create and Review" }}
        </v-btn>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-textarea
          :model-value="prettifiedRawJsonData"
          label="API Result Preview"
          append-inner-icon="mdi-lock"
          rows="10"
          variant="outlined"
          readonly
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
      <v-col>
        <!-- TODO: enforce presence and array-ness of result -->
        <v-textarea
          :model-value="prettifiedParsedJsonData"
          label="API Parsed Result Preview"
          hint="Result must be an array for API to integrate correctly."
          append-inner-icon="mdi-lock"
          rows="10"
          variant="outlined"
          readonly
          persistent-hint
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col class="d-flex justify-end">
        <v-btn
          :variant="isPersisted ? 'elevated' : 'outlined'"
          :loading="isLoading"
          color="primary"
          @click="updateAndCompleteIntegration"
        >
          Save and Return
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
  datasetId: {
    type: Number,
    required: true,
  },
  datasetIntegrationId: {
    type: Number,
    default: null,
  },
})

const emit = defineEmits(["completed"])

const snack = useSnack()

const isLoading = ref(false)
const isValid = ref(false)
const datasetIntegration = ref<Partial<DatasetIntegration>>({
  datasetId: props.datasetId,
})
const isPersisted = computed(() => !isNil(datasetIntegration.value.id))
const prettifiedRawJsonData = computed(() => {
  if (isNil(datasetIntegration.value.rawJsonData)) {
    return ""
  }

  try {
    return JSON.stringify(JSON.parse(datasetIntegration.value.rawJsonData), null, 2)
  } catch (error) {
    return JSON.stringify(error, null, 2)
  }
})
const prettifiedParsedJsonData = computed(() => {
  if (isNil(datasetIntegration.value.parsedJsonData)) {
    return ""
  }

  try {
    return JSON.stringify(JSON.parse(datasetIntegration.value.parsedJsonData), null, 2)
  } catch (error) {
    return JSON.stringify(error, null, 2)
  }
})

watch(
  () => props.datasetId,
  (newDatasetId) => {
    datasetIntegration.value = {
      datasetId: newDatasetId,
    }
  }
)

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
      return null
    }

    try {
      const rawJsonDataAsJson = JSON.parse(datasetIntegration.value.rawJsonData)
      const parsedResult = jmespath.search(
        rawJsonDataAsJson,
        datasetIntegration.value.jmesPathTransform
      )
      datasetIntegration.value.parsedJsonData = JSON.stringify(parsedResult)
    } catch (error) {
      datasetIntegration.value.parsedJsonData = JSON.stringify(error)
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

function createOrUpdateIntegration() {
  if (isPersisted.value) {
    updateDatasetIntegration()
  } else {
    createIntegration()
  }
}

function updateAndCompleteIntegration() {
  updateDatasetIntegration()
  emit("completed")
}

async function createIntegration() {
  if (!isValid.value) {
    snack.notify("Please fill out all required fields", {
      color: "error",
    })
    return
  }

  isLoading.value = true
  const attributes = pick(datasetIntegration.value, [
    "datasetId",
    "url",
    "headerKey",
    "headerValue",
  ])
  try {
    const { datasetIntegration: newDatasetIntegration } =
      await datasetIntegrationsApi.create(attributes)
    datasetIntegration.value = newDatasetIntegration
    snack.notify("Dataset integration created", {
      color: "success",
    })
  } catch (error) {
    if (error instanceof Error) {
      datasetIntegration.value.rawJsonData = JSON.stringify(error.message)
    } else {
      datasetIntegration.value.rawJsonData = `Unknown error occurred: ${error}`
    }
    snack.notify("Error creating dataset integration.", {
      color: "error",
    })
  } finally {
    isLoading.value = false
  }
}

async function updateDatasetIntegration() {
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
      attributes
    )
    datasetIntegration.value = newDatasetIntegration
    snack.notify("Dataset integration saved!", {
      color: "success",
    })
  } catch (error) {
    datasetIntegration.value.rawJsonData = JSON.stringify(error)
    snack.notify("Error saving dataset integration", {
      color: "error",
    })
  } finally {
    isLoading.value = false
  }
}
</script>
