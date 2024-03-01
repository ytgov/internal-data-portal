<template>
  <v-form v-model="isValid">
    <v-row>
      <v-col
        cols="12"
        md="6"
      >
        <v-text-field
          v-model="datasetIntegration.url"
          label="API Link *"
          :rules="[required]"
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
          :variant="isPersisted ? 'outlined' : 'elevated'"
          :loading="isLoading"
          color="primary"
          @click="createIntegration"
        >
          Create and Review Integration
        </v-btn>
      </v-col>
    </v-row>
    <v-row>
      <v-col
        cols="12"
        md="6"
      >
        <v-textarea
          :model-value="datasetIntegration.rawJsonData"
          label="API Result Preview"
          append-inner-icon="mdi-lock"
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
        <v-textarea
          :model-value="datasetIntegration.parsedJsonData"
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
      <v-col
        cols="12"
        md="6"
      >
        <v-btn
          :variant="isPersisted ? 'elevated' : 'outlined'"
          :loading="isLoading"
          color="primary"
          @click="saveAndReturn"
        >
          Save and Return
        </v-btn>
      </v-col>
    </v-row>
  </v-form>
</template>

<script lang="ts" setup>
import { computed, nextTick, ref, watch } from "vue"
import { useRouter } from "vue-router"
import { isEmpty, isNil } from "lodash"
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
})

const router = useRouter()
const snack = useSnack()

const isLoading = ref(false)
const isValid = ref(false)
const datasetIntegration = ref<Partial<DatasetIntegration>>({
  datasetId: props.datasetId,
})
const isPersisted = computed(() => !isNil(datasetIntegration.value.id))

watch(
  () => props.datasetId,
  (newDatasetId) => {
    datasetIntegration.value = {
      datasetId: newDatasetId,
    }
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

async function createIntegration() {
  if (!isValid.value) {
    snack.notify("Please fill out all required fields", {
      color: "error",
    })
    return
  }

  isLoading.value = true
  try {
    const { datasetIntegration: newDatasetIntegration } = await datasetIntegrationsApi.create(
      datasetIntegration.value
    )
    datasetIntegration.value = newDatasetIntegration
    snack.notify("Dataset integration created", {
      color: "success",
    })
  } catch (error) {
    datasetIntegration.value.rawJsonData = JSON.stringify(error, null, 2)
    snack.notify("Error creating dataset integration", {
      color: "error",
    })
  } finally {
    isLoading.value = false
  }
}

async function saveAndReturn() {
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
  try {
    const { datasetIntegration: newDatasetIntegration } = await datasetIntegrationsApi.update(
      datasetIntegrationId,
      datasetIntegration.value
    )
    datasetIntegration.value = newDatasetIntegration
    snack.notify("Dataset integration saved! Redirecting ...", {
      color: "success",
    })

    await nextTick()

    router.push({
      name: "DatasetDescriptionManagePage",
      params: { slug: props.slug },
    })
  } catch (error) {
    datasetIntegration.value.rawJsonData = JSON.stringify(error, null, 2)
    snack.notify("Error saving dataset integration", {
      color: "error",
    })
  } finally {
    isLoading.value = false
  }
}
</script>
