<template>
  <v-dialog
    v-model="showDialog"
    max-width="500px"
  >
    <v-form
      ref="form"
      v-model="isValid"
      @submit.prevent="updateAndClose"
    >
      <v-card :loading="isLoading">
        <v-card-title class="text-h5"> Edit Field </v-card-title>

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
import { computed, nextTick, ref, watch } from "vue"
import { useRoute, useRouter } from "vue-router"
import { cloneDeep } from "lodash"

import { VForm } from "vuetify/lib/components/index.mjs"

import { required } from "@/utils/validators"
import datasetFieldsApi, { DatasetField, DatasetFieldDataTypes } from "@/api/dataset-fields-api"
import useSnack from "@/use/use-snack"

const emit = defineEmits(["saved"])

const snack = useSnack()

const datasetFieldTypes = Object.values(DatasetFieldDataTypes)
const datasetField = ref<Partial<DatasetField>>({})
const datasetFieldId = computed(() => datasetField.value.id)

const router = useRouter()
const route = useRoute()

const showDialog = ref(false)
const form = ref<InstanceType<typeof VForm> | null>(null)
const isLoading = ref(false)
const isValid = ref(false)

watch(
  () => showDialog.value,
  (value) => {
    if (route.query.showEdit === datasetFieldId.value?.toString()) return

    if (value) {
      router.push({ query: { showEdit: datasetFieldId.value } })
    } else {
      router.push({ query: { showEdit: undefined } })
    }
  }
)

function show(newDatasetField: DatasetField) {
  datasetField.value = cloneDeep(newDatasetField)
  showDialog.value = true
}

function close() {
  showDialog.value = false
  resetDatasetField()
  form.value?.resetValidation()
}

async function updateAndClose() {
  if (!isValid.value) {
    snack.notify("Please fill out all required fields", {
      color: "error",
    })
    return
  }

  isLoading.value = true
  try {
    if (datasetFieldId.value === undefined) {
      throw new Error("Dataset field id could not be found")
    }

    const { datasetField: newDatasetField } = await datasetFieldsApi.update(
      datasetFieldId.value,
      datasetField.value
    )
    close()

    await nextTick()
    emit("saved", newDatasetField.id)
    snack.notify("Dataset field saved", { color: "success" })
  } catch (error) {
    snack.notify(`Failed to save dataset field ${error}`, { color: "error" })
  } finally {
    isLoading.value = false
  }
}

function resetDatasetField() {
  datasetField.value = {}
}

defineExpose({
  show,
})
</script>
