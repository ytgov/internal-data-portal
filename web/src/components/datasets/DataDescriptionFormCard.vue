<template>
  <v-card>
    <v-card-title>Data Description</v-card-title>
    <v-card-text>
      <!-- TODO: add loader -->
      <v-form
        v-if="dataset"
        class="d-flex"
      >
        <v-col cols="6">
          <v-row>
            <v-col col="8">
              <v-text-field
                label="Name"
                variant="outlined"
                :value="dataset.name"
              />
            </v-col>
            <v-col
              cols="4"
              class="d-flex justify-center mt-3"
            >
              <v-btn
                color="primary"
                variant="outlined"
                >Add API Link</v-btn
              >
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12">
              <v-textarea
                label="Description"
                variant="outlined"
                rows="6"
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-checkbox label="Spatial?" />
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="3">
              <v-checkbox label="Live data?" />
            </v-col>
            <v-col cols="9">
              <DatePicker
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
              <v-checkbox label="inactive" />
            </v-col>
            <v-col cols="9">
              <DatePicker
                :field-options="{
                  label: 'Date Deactivated',
                }"
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12">
              <v-textarea
                label="Terms of Use"
                variant="outlined"
                rows="4"
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12">
              <v-textarea
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

import { useDataset } from "@/use/use-dataset"

import DatePicker from "@/components/DatePicker.vue"

const props = defineProps({
  slug: {
    type: String,
    required: true,
  },
})

const { slug } = toRefs(props)
const { dataset } = useDataset(slug)
</script>
