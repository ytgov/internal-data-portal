<template>
  <v-card>
    <v-card-title class="d-flex justify-space-between align-end">
      Subscriptions

      <!-- TODO: replace boilerplate with Email Users button -->
      <v-btn @click="emailUsers">TODO: Email Users</v-btn>
    </v-card-title>
    <v-card-text>
      <v-skeleton-loader
        v-if="isNil(dataset)"
        type="table"
      />
      <AccessRequestsManageTable
        v-else
        :dataset-id="dataset.id"
      />
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { toRefs } from "vue"
import { isNil } from "lodash"

import useDataset from "@/use/use-dataset"

import AccessRequestsManageTable from "@/components/access-requests/AccessRequestsManageTable.vue"

const props = defineProps({
  slug: {
    type: String,
    required: true,
  },
})

const { slug } = toRefs(props)
const { dataset } = useDataset(slug)

function emailUsers() {
  alert("TODO: Email Users")
}
</script>
