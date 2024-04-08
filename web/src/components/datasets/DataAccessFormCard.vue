<template>
  <v-card>
    <v-card-title> Data Access </v-card-title>
    <v-card-text>
      <v-skeleton-loader
        v-if="isNil(dataset) || isEmpty(dataset.integration)"
        type="card"
      />
      <v-form
        v-else
        class="mt-6"
      >
        <v-row>
          <v-col cols="12">
            <v-text-field
              :model-value="dataset.integration.url"
              label="API URL"
              append-inner-icon="mdi-lock"
              variant="outlined"
              readonly
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12">
            <PasswordTextField
              :model-value="dataset.integration.headerValue"
              label="Subscription License"
              variant="outlined"
              readonly
            />
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
import { toRefs } from "vue"
import { isNil, isEmpty } from "lodash"

import useDataset from "@/use/use-dataset"

import PasswordTextField from "@/components/PasswordTextField.vue"

const props = defineProps({
  slug: {
    type: String,
    required: true,
  },
})

const { slug } = toRefs(props)
const { dataset } = useDataset(slug)
</script>
