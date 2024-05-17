<template>
  <v-card>
    <v-card-title class="d-flex justify-space-between align-center">
      Visualization Properties
      <SaveStateProgress
        :saving="isLoading"
        @click="saveAndNotify"
      />
    </v-card-title>

    <v-card-text>
      <v-skeleton-loader
        v-if="isNil(visualizationControl)"
        type="card"
      />
      <v-form
        v-else
        class="mt-6"
      >
        <v-row>
          <v-col
            cols="12"
            md="3"
            class="py-0"
          >
            <v-checkbox
              v-model="visualizationControl.isDownloadableAsCsv"
              label="Allow Download to CSV?"
              @update:model-value="saveAndNotify"
            />
          </v-col>
          <v-col
            cols="12"
            md="9"
            class="py-0"
          >
            <v-checkbox
              v-model="visualizationControl.hasPreview"
              label="Enable search customization?"
              @update:model-value="saveAndNotify"
            />
          </v-col>
        </v-row>
        <v-row class="ml-md-6">
          <v-col
            cols="0"
            md="3"
            class="py-0"
          />
          <v-col
            cols="12"
            md="2"
            class="py-0"
          >
            <v-checkbox
              v-model="visualizationControl.hasFieldsExcludedFromPreview"
              label="Exclude fields from search?"
              @update:model-value="saveAndNotify"
            />
          </v-col>
          <v-col
            cols="12"
            md="7"
            class="py-0"
          >
            <DatasetFieldsSelect
              :model-value="searchExcludedDatasetFieldsIds"
              :dataset-id="visualizationControl.datasetId"
              :is-saving="isLoading"
              label="Excluded Fields"
              variant="outlined"
              @update:model-value="saveSearchExcludedDatasetFieldsAndNotify"
            />
          </v-col>
        </v-row>
        <v-row class="ml-md-6">
          <v-col
            cols="0"
            md="3"
            class="py-0"
          />
          <v-col
            cols="12"
            md="2"
            class="py-0"
          >
            <v-checkbox
              v-model="visualizationControl.hasPreviewRowLimit"
              label="Limit search results?"
              @update:model-value="saveAndNotify"
            />
          </v-col>
          <v-col
            cols="12"
            md="2"
            class="py-0"
          >
            <v-text-field
              v-model="visualizationControl.previewRowLimit"
              label="Max Results"
              type="number"
              variant="outlined"
              clearable
              @input="debouncedSaveAndNotify"
              @click:clear="saveAndNotify"
            />
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
import { computed, toRefs } from "vue"
import { debounce, isNil } from "lodash"

import useSnack from "@/use/use-snack"
import useVisualizationControl from "@/use/use-visualization-control"

import SaveStateProgress from "@/components/SaveStateProgress.vue"
import DatasetFieldsSelect from "@/components/dataset-fields/DatasetFieldsSelect.vue"

const props = defineProps({
  visualizationControlId: {
    type: Number,
    required: true,
  },
})

const emit = defineEmits(["saved"])

const { visualizationControlId } = toRefs(props)
const { visualizationControl, save, isLoading } = useVisualizationControl(visualizationControlId)
const searchExcludedDatasetFieldsIds = computed(() => {
  if (isNil(visualizationControl.value)) {
    return []
  }

  if (isNil(visualizationControl.value.searchExcludedDatasetFields)) {
    return []
  }

  return visualizationControl.value.searchExcludedDatasetFields.map(
    (datasetField) => datasetField.id
  )
})

const snack = useSnack()

async function saveAndNotify() {
  try {
    await save()
    emit("saved")
    snack.notify("Visualization properties saved", {
      color: "success",
    })
  } catch (error) {
    snack.notify("Error saving visualization properties", {
      color: "error",
    })
  }
}

const debouncedSaveAndNotify = debounce(saveAndNotify, 1000)

async function saveSearchExcludedDatasetFieldsAndNotify(datasetFieldIds: number[]) {
  const searchExcludedDatasetFieldsAttributes = datasetFieldIds.map((datasetFieldId) => ({
    id: datasetFieldId,
    isExcludedFromPreview: true,
  }))

  try {
    await save({
      searchExcludedDatasetFieldsAttributes,
    })
    emit("saved")
    snack.notify("Visualization properties saved", {
      color: "success",
    })
  } catch (error) {
    snack.notify("Error saving visualization properties", {
      color: "error",
    })
  }
}
</script>
