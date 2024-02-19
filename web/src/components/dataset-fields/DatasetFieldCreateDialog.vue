<template>
  <v-dialog
    v-model="showDialog"
    max-width="500px"
  >
    <template #activator="{ props: dialogProps }">
      <v-btn
        color="primary"
        v-bind="dialogProps"
      >
        Add Field
      </v-btn>
    </template>
    <v-form
      ref="form"
      v-model="isValid"
      @submit.prevent="createAndClose"
    >
      <v-card :loading="isLoading">
        <v-card-title class="text-h5"> Create Field </v-card-title>

        <v-card-text>
          <v-row>
            <v-col>
              <v-text-field
                v-model="datasetField.name"
                :rules="[required]"
                label="Field Name *"
                required
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-text-field
                v-model="datasetField.displayName"
                :rules="[required]"
                label="Display Name *"
                required
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-textarea
                v-model="datasetField.description"
                label="Field Description"
                rows="6"
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-select
                v-model="datasetField.dataType"
                :items="datasetFieldTypes"
                :rules="[required]"
                label="Data Type *"
                required
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-textarea
                v-model="datasetField.note"
                label="Notes"
                rows="10"
              />
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            :loading="isLoading"
            color="error"
            @click="close"
          >
            Cancel
          </v-btn>
          <v-btn
            :loading="isLoading"
            color="primary"
            type="submit"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script lang="ts" setup>
import { nextTick, ref, watch } from "vue"
import { useRoute, useRouter } from "vue-router"

import { VForm } from "vuetify/lib/components/index.mjs"

import { required } from "@/utils/validators"
import datasetFieldsApi, { DatasetField, DatasetFieldDataTypes } from "@/api/dataset-fields-api"
import useSnack from "@/use/use-snack"

const props = defineProps({
  datasetId: {
    type: Number,
    default: () => null,
  },
})

const emit = defineEmits(["created"])

const snack = useSnack()

const datasetFieldTypes = Object.values(DatasetFieldDataTypes)
const datasetField = ref<Partial<DatasetField>>({
  datasetId: props.datasetId,
})

const router = useRouter()
const route = useRoute()
const showDialog = ref(route.query.showCreate === "true")
const form = ref<InstanceType<typeof VForm> | null>(null)
const isLoading = ref(false)
const isValid = ref(false)

watch(
  () => props.datasetId,
  () => {
    resetDatasetField()
  },
  { immediate: true }
)

watch(
  () => showDialog.value,
  (value) => {
    if (value) {
      router.push({ query: { showCreate: "true" } })
    } else {
      router.push({ query: { showCreate: undefined } })
    }
  }
)

function close() {
  showDialog.value = false
  resetDatasetField()
  form.value?.resetValidation()
}

async function createAndClose() {
  if (!isValid.value) {
    snack.notify("Please fill out all required fields", {
      color: "error",
    })
    return
  }

  isLoading.value = true
  try {
    const { datasetField: newDatasetField } = await datasetFieldsApi.create(datasetField.value)
    close()

    await nextTick()
    emit("created", newDatasetField.id)
    snack.notify("Dataset field created", { color: "success" })
  } catch (error) {
    snack.notify(`Failed to create dataset field ${error}`, { color: "error" })
  } finally {
    isLoading.value = false
  }
}

function resetDatasetField() {
  datasetField.value = {
    datasetId: props.datasetId,
  }
}
</script>
