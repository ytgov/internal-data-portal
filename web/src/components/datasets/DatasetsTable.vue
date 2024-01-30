<template>
  <v-data-table
    v-model:items-per-page="itemsPerPage"
    v-model:page="page"
    :headers="headers"
    :items="datasets"
    :items-length="totalCount"
    :loading="isLoading"
    class="elevation-1"
  >
  </v-data-table>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue"

import useDatasets from "@/use/use-datasets"

// Dataset - Dataset#name
// Description - Dataset#description
// Keywords - Tags through Taggings
// Owner - Dataset#owner -> department
// Access - magic aggregate field that describes the type of access the current user has available against the database, should be serialized in the back-end from the AccessGrants for the dataset.
// (unlabeled) - aggregate of possible actions and states depending on available AccessGrants and current AccessRequests, and the type of access request (i.e. subscriptions). This is pretty complex logic and would benefit from testing.
// RequestAccessButton.vue
// Either opens a request access dialog or redirects to a request access form
// SubscribeToDatasetButton.vue
// Either opens a subscription request dialog or redirects to a subscription request form
// Subscribed state
// Approved state
// Awaiting approval state

const headers = ref([
  { title: "Name", key: "name" },
  { title: "Description", key: "description" },
  { title: "Keywords", key: "tags" }, // or maybe taggings
  { title: "Owner", key: "owner" },
  { title: "Access", key: "access" },
  { title: "", key: "actions" },
])

const itemsPerPage = ref(10)
const page = ref(1)
const datasetsQuery = computed(() => ({
  perPage: itemsPerPage.value,
  page: page.value,
}))
const { datasets, isLoading, totalCount } = useDatasets(datasetsQuery)
</script>
