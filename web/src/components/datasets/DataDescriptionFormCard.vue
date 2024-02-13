<template>
  <v-card>
    <v-card-title>Data Description</v-card-title>
    <v-card-text>
      <!-- TODO: make the skeleton loader an external component that matches the form -->
      <v-skeleton-loader
        v-if="isNil(dataset)"
        type="card"
      />
      <v-form
        v-else
        ref="form"
        v-model="isValid"
        class="d-flex mt-6"
        @submit.prevent="saveWrapper"
      >
        <v-row>
          <v-col
            cols="12"
            md="6"
          >
            <v-row>
              <v-col
                cols="12"
                md="8"
              >
                <v-text-field
                  v-model="dataset.name"
                  :rules="[required]"
                  label="Name *"
                  variant="outlined"
                  required
                />
              </v-col>
              <v-col
                cols="12"
                md="4"
                class="d-flex justify-center mt-3"
              >
                <AddApiDialog
                  v-model="dataset.subscriptionUrl"
                  @added="saveWrapper"
                />
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
                <v-textarea
                  v-model="dataset.description"
                  :rules="[required]"
                  label="Description *"
                  variant="outlined"
                  rows="6"
                  required
                />
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-checkbox
                  v-model="dataset.isSpatialData"
                  label="Spatial?"
                />
              </v-col>
            </v-row>
            <v-row>
              <v-col
                cols="12"
                md="3"
              >
                <v-checkbox
                  v-model="dataset.isLiveData"
                  label="Live data?"
                />
              </v-col>
              <v-col
                cols="12"
                md="9"
              >
                <DatePicker
                  v-model="dataset.publishedAt"
                  :field-options="{
                    label: 'Date Published',
                  }"
                />
              </v-col>
            </v-row>
          </v-col>
          <v-col
            cols="12"
            md="6"
          >
            <v-row>
              <v-col
                cols="12"
                md="3"
              >
                <v-checkbox
                  :model-value="isInactive"
                  label="inactive"
                  @update:model-value="deactivateDataset"
                />
              </v-col>
              <v-col
                cols="12"
                md="9"
              >
                <DatePicker
                  v-model="dataset.deactivatedAt"
                  :field-options="{
                    label: 'Date Deactivated',
                  }"
                />
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
                <v-textarea
                  v-model="dataset.termsOfUse"
                  label="Terms of Use"
                  variant="outlined"
                  rows="4"
                />
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
                <v-textarea
                  v-model="dataset.credits"
                  label="Credits"
                  variant="outlined"
                  rows="4"
                />
              </v-col>
            </v-row>
            <v-row>
              <v-col
                cols="12"
                class="d-flex justify-end"
              >
                <v-btn
                  v-if="isValid"
                  :loading="isLoading"
                  type="submit"
                  color="primary"
                >
                  Save
                </v-btn>
                <v-tooltip v-else>
                  <template #activator="{ props: tooltipProps }">
                    <span v-bind="tooltipProps">
                      <v-btn
                        disabled
                        type="submit"
                        color="primary"
                      >
                        Save
                        <v-icon end>mdi-help-circle-outline</v-icon>
                      </v-btn>
                    </span>
                  </template>
                  <span class="text-white">Some required fields are blank.</span>
                </v-tooltip>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
import { computed, ref, toRefs } from "vue"
import { isNil } from "lodash"

import { type VForm } from "vuetify/lib/components/index.mjs"

import { required } from "@/utils/validators"
import { useSnack } from "@/use/use-snack"
import { useDataset } from "@/use/use-dataset"

import DatePicker from "@/components/DatePicker.vue"
import AddApiDialog from "@/components/datasets/data-description-form-card/AddApiDialog.vue"

const props = defineProps({
  slug: {
    type: String,
    required: true,
  },
})

const { slug } = toRefs(props)
const { dataset, isLoading, save } = useDataset(slug)
const snack = useSnack()

const form = ref<InstanceType<typeof VForm> | null>(null)
const isValid = ref(null)
const isInactive = computed<boolean>(() => !isNil(dataset.value?.deactivatedAt))

function deactivateDataset(value: boolean | null) {
  if (isNil(dataset.value)) return

  if (value) {
    // TODO: verify this is creating the correct date value
    dataset.value.deactivatedAt = new Date().toISOString()
  } else {
    dataset.value.deactivatedAt = null
  }
}

async function saveWrapper() {
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
</script>
