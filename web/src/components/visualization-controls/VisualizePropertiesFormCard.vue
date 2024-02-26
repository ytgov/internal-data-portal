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
        class="d-flex mt-6"
      >
        <v-row>
          <v-col cols="12">
            <v-checkbox
              v-model="visualizationControl.isDowloadableAsCsv"
              label="Allow Download to CSV?"
              variant="outlined"
              @update:model-value="debouncedSaveAndNotify"
            />
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
import { toRefs } from "vue"
import { debounce, isNil } from "lodash"

import useSnack from "@/use/use-snack"
import useVisualizationControl from "@/use/use-visualization-control"

import SaveStateProgress from "@/components/SaveStateProgress.vue"

const props = defineProps({
  visualizationControlId: {
    type: Number,
    required: true,
  },
})

const { visualizationControlId } = toRefs(props)
const { visualizationControl, save, isLoading } = useVisualizationControl(visualizationControlId)

const snack = useSnack()

async function saveAndNotify() {
  try {
    await save()
    snack.notify("Notes saved", {
      color: "success",
    })
  } catch (error) {
    snack.notify("Error saving notes", {
      color: "error",
    })
  }
}

const debouncedSaveAndNotify = debounce(saveAndNotify, 1000)
</script>
