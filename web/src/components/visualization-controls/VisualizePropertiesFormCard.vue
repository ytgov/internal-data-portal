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
              label="Limit data view on search?"
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
              label="Fields"
              @update:model-value="saveAndNotify"
            />
          </v-col>
          <v-col
            cols="12"
            md="7"
            class="py-0"
          >
            <SearchFieldExclusionsSelect
              :model-value="searchFieldExclusionsDatasetFieldIds"
              :dataset-id="visualizationControl.datasetId"
              :is-saving="isLoading"
              label="Fields"
              variant="outlined"
              @update:model-value="saveSearchFieldExclusionsAndNotify"
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
              label="Rows"
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
              label="Limit"
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
import SearchFieldExclusionsSelect from "@/components/search-field-exclusions/SearchFieldExclusionsSelect.vue"

const props = defineProps({
  visualizationControlId: {
    type: Number,
    required: true,
  },
})

const { visualizationControlId } = toRefs(props)
const { visualizationControl, save, isLoading } = useVisualizationControl(visualizationControlId)

const searchFieldExclusionsDatasetFieldIds = computed(() => {
  if (isNil(visualizationControl.value)) {
    return []
  }

  if (isNil(visualizationControl.value.searchFieldExclusions)) {
    return []
  }

  return visualizationControl.value.searchFieldExclusions.map(
    (searchFieldExclusion) => searchFieldExclusion.datasetFieldId
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

async function saveSearchFieldExclusionsAndNotify(datasetFieldIds: number[]) {
  const searchFieldExclusionsAttributes = datasetFieldIds.map((datasetFieldId) => ({
    visualizationControlId: props.visualizationControlId,
    datasetFieldId,
  }))

  try {
    await save({
      searchFieldExclusionsAttributes,
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
