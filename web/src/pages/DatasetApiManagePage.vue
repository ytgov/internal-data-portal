<template>
  <v-container>
    <h2 class="mb-6">Link API</h2>

    <!-- TODO: make the skeleton loader an external component that matches the form -->
    <v-skeleton-loader
      v-if="isNil(dataset)"
      type="card"
    />
    <v-form
      v-else
      @submit.prevent="saveAndReturn"
    >
      <v-row>
        <v-col
          cols="12"
          md="6"
        >
          <v-text-field
            v-model="dataset.apiUrl"
            label="API Link"
            variant="outlined"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col
          cols="12"
          md="6"
        >
          <v-text-field
            v-model="dataset.apiHeaderKey"
            label="Header Key"
            variant="outlined"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col
          cols="12"
          md="6"
        >
          <v-text-field
            v-model="dataset.apiHeaderValue"
            label="Header Value"
            variant="outlined"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col
          cols="12"
          md="6"
        >
          <v-btn
            color="primary"
            @click="fetchApiResults"
          >
            Test API
          </v-btn>
        </v-col>
      </v-row>
      <v-row>
        <v-col
          cols="12"
          md="6"
        >
          <h3>API Result Preview</h3>
          <v-textarea
            :model-value="apiResultPreview"
            rows="10"
            readonly
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col
          cols="12"
          md="6"
        >
          <v-btn
            color="primary"
            type="submit"
            variant="outlined"
          >
            Save and Return
          </v-btn>
        </v-col>
      </v-row>
    </v-form>
  </v-container>
</template>

<script lang="ts" setup>
import { ref, toRefs } from "vue"
import { isNil } from "lodash"

import http from "@/api/http-client"

import useBreadcrumbs from "@/use/use-breadcrumbs"
import useDataset from "@/use/use-dataset"

const props = defineProps({
  slug: {
    type: String,
    required: true,
  },
})

const { slug } = toRefs(props)
const { dataset } = useDataset(slug)

const apiResultPreview = ref<string | null>(null)

async function fetchApiResults() {
  console.log(`dataset.value.apiUrl:`, dataset.value.apiUrl)
  console.log(`dataset.value.apiHeaderKey:`, dataset.value.apiHeaderKey)
  console.log(`dataset.value.apiHeaderValue:`, dataset.value.apiHeaderValue)
  try {
    const { data } = await http.get(dataset.value.apiUrl, {
      headers: {
        [dataset.value.apiHeaderKey]: dataset.value.apiHeaderValue,
      },
    })
    apiResultPreview.value = JSON.stringify(data, null, 2)
  } catch (error) {
    apiResultPreview.value = JSON.stringify(error, null, 2)
  }
}

function saveAndReturn() {
  alert("TODO: return to dataset description manage page")
}

const { setBreadcrumbs } = useBreadcrumbs()

setBreadcrumbs([
  {
    title: "Datasets",
    to: {
      name: "DatasetsPage",
    },
  },
  {
    title: "Description",
    to: {
      name: "DatasetDescriptionReadPage",
      params: { slug: props.slug },
    },
  },
  {
    title: "Manage",
    to: {
      name: "DatasetDescriptionManagePage",
      params: { slug: props.slug },
    },
  },
  {
    title: "Link API",
    to: {
      name: "DatasetApiManagePage",
      params: { slug: props.slug },
    },
  },
])
</script>
