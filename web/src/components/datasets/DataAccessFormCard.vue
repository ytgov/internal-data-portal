<template>
  <v-card>
    <v-card-title class="d-flex justify-space-between align-center">
      Data Access
      <SaveStateProgress
        :saving="isLoading"
        @click="saveAndNotify"
      />
    </v-card-title>
    <v-card-text>
      <v-skeleton-loader
        v-if="isNil(dataset)"
        type="card"
      />
      <v-form
        v-else
        class="mt-6"
      >
        <v-row>
          <v-col cols="12">
            <v-text-field
              v-model="dataset.subscriptionUrl"
              label="API URL"
              variant="outlined"
              @update:model-value="debouncedSaveAndNotify"
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12">
            <v-text-field
              v-model="dataset.subscriptionAccessCode"
              label="Subscription License"
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

import useDataset from "@/use/use-dataset"
import useSnack from "@/use/use-snack"

import SaveStateProgress from "@/components/SaveStateProgress.vue"

const props = defineProps({
  slug: {
    type: String,
    required: true,
  },
})

const snack = useSnack()

const { slug } = toRefs(props)
const { dataset, isLoading, save } = useDataset(slug)

async function saveAndNotify() {
  try {
    await save()
    snack.notify("Dataset saved", {
      color: "success",
    })
  } catch (error) {
    snack.notify("Error saving dataset", {
      color: "error",
    })
  }
}

const debouncedSaveAndNotify = debounce(saveAndNotify, 1000)
</script>
