<template>
  <v-card>
    <v-card-title class="d-flex justify-space-between align-center">
      Owner Notes
      <SaveStateProgress
        :saving="isLoading"
        @click="save"
      />
    </v-card-title>

    <v-card-text>
      <v-skeleton-loader
        v-if="isNil(dataset)"
        type="card"
      />
      <v-form
        v-else
        class="d-flex mt-6"
      >
        <v-row>
          <v-col cols="12">
            <v-textarea
              v-model="dataset.ownerNotes"
              label="Notes"
              variant="outlined"
              rows="8"
              @update:model-value="debouncedSave"
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

import useDataset from "@/use/use-dataset"
import useSnack from "@/use/use-snack"

import SaveStateProgress from "@/components/SaveStateProgress.vue"

const props = defineProps({
  slug: {
    type: String,
    required: true,
  },
})

const { slug } = toRefs(props)
const { dataset, save, isLoading } = useDataset(slug)
const snack = useSnack()

const debouncedSave = debounce(async () => {
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
}, 1000)
</script>
