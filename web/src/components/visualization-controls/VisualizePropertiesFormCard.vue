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
              v-model="visualizationControl.isDowloadableAsCsv"
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
              v-model="visualizationControl.hasSearchRestrictions"
              label="Customize search?"
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
              v-model="visualizationControl.hasSearchFieldRestrictions"
              label="Exclude Fields from Search?"
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
              v-model="visualizationControl.hasSearchRowLimits"
              label="Limit Search Results?"
              @update:model-value="saveAndNotify"
            />
          </v-col>
          <v-col
            cols="12"
            md="2"
            class="py-0"
          >
            <v-text-field
              v-model="visualizationControl.searchRowLimitMaximum"
              label="Result Limit"
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
    isExcludedFromSearch: true,
  }))

  try {
    await save({
      searchExcludedDatasetFieldsAttributes,
    })
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
