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
          color="primary"
          @click="createIntegration"
        >
          Create and Review
        </v-btn>
      </v-col>
    </v-row>
  </v-form>
</template>

<script lang="ts" setup>
import { ref, watch } from "vue"
import { pick } from "lodash"

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

const emit = defineEmits(["completed"])

const snack = useSnack()

const isLoading = ref(false)
const isValid = ref(false)
const datasetIntegration = ref<Partial<DatasetIntegration>>({
  datasetId: props.datasetId,
})

watch(
  () => props.datasetId,
  (newDatasetId) => {
    datasetIntegration.value = {
      datasetId: newDatasetId,
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
    emit("completed")
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
</script>
