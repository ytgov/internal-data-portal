<template>
  <v-card>
    <v-card-title>Data Description</v-card-title>
    <v-card-text>
      <div
        v-if="isNil(dataset) || isLoading"
        class="d-flex justify-center"
      >
        <v-progress-circular
          indeterminate
          color="yg-blue"
        />
      </div>
      <v-form
        v-else
        class="d-flex"
      >
        <v-col cols="6">
          <v-row>
            <v-col col="8">
              <v-text-field
                v-model="dataset.name"
                label="Name"
                variant="outlined"
              />
            </v-col>
            <v-col
              cols="4"
              class="d-flex justify-center mt-3"
            >
              <v-btn
                color="primary"
                variant="outlined"
                @click="openAddApiDialog"
                >Add API Link</v-btn
              >
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12">
              <v-textarea
                v-model="dataset.description"
                label="Description"
                variant="outlined"
                rows="6"
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
            <v-col cols="3">
              <v-checkbox
                v-model="dataset.isLiveData"
                label="Live data?"
              />
            </v-col>
            <v-col cols="9">
              <DatePicker
                v-model="dataset.publishedAt"
                :field-options="{
                  label: 'Date Published',
                }"
              />
            </v-col>
          </v-row>
        </v-col>
        <v-col cols="6">
          <v-row>
            <v-col cols="3">
              <!-- TODO: trigger wiping deactivated at -->
              <v-checkbox
                :value="dataset.deactivatedAt === null"
                label="inactive"
              />
            </v-col>
            <v-col cols="9">
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
        </v-col>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
import { toRefs } from "vue"
import { isNil } from "lodash"

import { useDataset } from "@/use/use-dataset"

import DatePicker from "@/components/DatePicker.vue"

const props = defineProps({
  slug: {
    type: String,
    required: true,
  },
})

const { slug } = toRefs(props)
const { dataset, isLoading } = useDataset(slug)

function openAddApiDialog() {
  alert("TODO: open add API dialog")
}
</script>
