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
        Upload Data
      </v-btn>
    </template>
    <v-form
      ref="form"
      v-model="isValid"
      @submit.prevent="uploadAndClose"
    >
      <v-card :loading="isLoading">
        <v-card-title class="text-h5"> Upload Data </v-card-title>

        <v-card-text>
          <v-row>
            <v-col>
              <v-file-input
                label="File input *"
                variant="outlined"
                :rules="[required]"
                required
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
            Upload
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script lang="ts" setup>
import { nextTick, ref, watch } from "vue"
import { useRoute, useRouter } from "vue-router"

import { type VBtn, type VForm } from "vuetify/lib/components/index.mjs"

import { required } from "@/utils/validators"
import datasetFilesApi, { DatasetFile } from "@/api/dataset-files-api"
import useSnack from "@/use/use-snack"

const props = defineProps<{
  datasetId: number
}>()

const emit = defineEmits(["created"])

const snack = useSnack()

const datasetFile = ref<Partial<DatasetFile>>({
  datasetId: props.datasetId,
})

const router = useRouter()
const route = useRoute()
const showDialog = ref(route.query.showUpload === "true")
const form = ref<InstanceType<typeof VForm> | null>(null)
const isLoading = ref(false)
const isValid = ref(false)

watch(
  () => props.datasetId,
  () => {
    resetDatasetFile()
  },
  { immediate: true }
)

watch(
  () => showDialog.value,
  (value) => {
    if (value) {
      router.push({ query: { showUpload: "true" } })
    } else {
      router.push({ query: { showUpload: undefined } })
    }
  }
)

function close() {
  showDialog.value = false
  resetDatasetFile()
  form.value?.resetValidation()
}

async function uploadAndClose() {
  if (!isValid.value) {
    snack.notify("Please fill out all required fields", {
      color: "error",
    })
    return
  }

  isLoading.value = true
  try {
    const { datasetFile: newDatasetFile } = await datasetFilesApi.create(datasetFile.value)
    close()

    await nextTick()
    emit("created", newDatasetFile.id)
    snack.notify("Dataset file created", { color: "success" })
  } catch (error) {
    snack.notify(`Failed to create dataset file ${error}`, { color: "error" })
  } finally {
    isLoading.value = false
  }
}

function resetDatasetFile() {
  datasetFile.value = {
    datasetId: props.datasetId,
  }
}
</script>
