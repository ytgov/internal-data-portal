<template>
  <v-dialog
    v-model="showDialog"
    max-width="500px"
  >
    <v-form @submit.prevent="deleteAndClose">
      <v-card :loading="isLoading">
        <v-card-title class="text-h5"> Delete Field </v-card-title>

        <v-card-text v-if="isNil(datasetField)">
          <v-skeleton-loader type="text" />
        </v-card-text>
        <v-card-text v-else>
          <v-row>
            <v-col>
              <v-text-field
                v-model="datasetField.name"
                label="Field Name"
                readonly
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-text-field
                v-model="datasetField.displayName"
                label="Display Name"
                readonly
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-textarea
                v-model="datasetField.description"
                label="Field Description"
                rows="6"
                readonly
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-select
                v-model="datasetField.dataType"
                :items="datasetFieldTypes"
                label="Data Type"
                readonly
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-textarea
                v-model="datasetField.note"
                label="Notes"
                rows="10"
                readonly
              />
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            :loading="isLoading"
            color="primary"
            @click="close"
          >
            Cancel
          </v-btn>
          <v-btn
            :loading="isLoading"
            color="error"
            type="submit"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script lang="ts" setup>
import { computed, nextTick, ref, watch } from "vue"
import { useRoute, useRouter } from "vue-router"
import { isNil, cloneDeep } from "lodash"

import { VForm } from "vuetify/lib/components/index.mjs"

import datasetFieldsApi, { DatasetField, DatasetFieldDataTypes } from "@/api/dataset-fields-api"
import useSnack from "@/use/use-snack"

const emit = defineEmits(["deleted"])

const snack = useSnack()

const datasetFieldTypes = Object.values(DatasetFieldDataTypes)
const datasetField = ref<DatasetField | null>(null)
const datasetFieldId = computed(() => datasetField.value?.id)

const router = useRouter()
const route = useRoute()

const showDialog = ref(false)
const isLoading = ref(false)

watch(
  () => showDialog.value,
  (value) => {
    if (value) {
      if (route.query.showDelete === datasetFieldId.value?.toString()) {
        return
      }

      router.push({ query: { showDelete: datasetFieldId.value } })
    } else {
      router.push({ query: { showDelete: undefined } })
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
}

async function deleteAndClose() {
  isLoading.value = true
  try {
    if (datasetFieldId.value === undefined) {
      throw new Error("Dataset field id could not be found")
    }

    await datasetFieldsApi.delete(datasetFieldId.value)
    close()

    await nextTick()
    emit("deleted", datasetFieldId.value)
    snack.notify("Dataset field deleted", { color: "success" })
  } catch (error) {
    snack.notify(`Failed to delete dataset field ${error}`, { color: "error" })
  } finally {
    isLoading.value = false
  }
}

function resetDatasetField() {
  datasetField.value = null
}

defineExpose({
  show,
})
</script>
