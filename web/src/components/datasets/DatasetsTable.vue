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
    <template #item.stewardshipEvolutions="{ value }">
      {{ formatOwnership(value[0]) }}
    </template>
    <template #item.tags="{ value }">
      {{ formatTags(value) }}
    </template>
    <template #item.access="{ value }">
      {{ formatAccess(value) }}
    </template>
    <template #item.actions="{ value }"> TODO </template>
  </v-data-table>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue"
import { useI18n } from "vue-i18n"

import acronymize from "@/utils/acronymize"
import useDatasets, { type StewardshipEvolution } from "@/use/use-datasets"

type Tag = {
  id: number
  name: string
  createdAt: string
  updatedAt: string
}

const { t } = useI18n()

// Dataset - Dataset#name
// Description - Dataset#description
// Keywords - Tags through Taggings
// Owner - Dataset#owner -> department
// Access - magic aggregate field that describes the type of access the current user has available against the database, should be serialized in the back-end from the AccessGrants for the dataset.
// (unlabeled) - aggregate of possible actions and states depending on available AccessGrants and current AccessRequests, and the type of access request (i.e. subscriptions). This is pretty complex logic and would benefit from testing.
// - RequestAccessButton.vue - Either opens a request access dialog or redirects to a request access form
// - SubscribeToDatasetButton.vue - Either opens a subscription request dialog or redirects to a subscription request form
// - Subscribed state
// - Approved state
// - Awaiting approval state

const headers = ref([
  { title: "Dataset", key: "name" },
  { title: "Description", key: "description" },
  { title: "Keywords", key: "tags" },
  { title: "Owner", key: "stewardshipEvolutions" },
  { title: "Access", key: "access" },
  { title: "", key: "actions" },
])

const itemsPerPage = ref(10)
const page = ref(1)
const datasetsQuery = computed(() => ({
  perPage: itemsPerPage.value,
  page: page.value,
}))
const { datasets, isLoading, totalCount, fetch: refresh } = useDatasets(datasetsQuery)

function formatOwnership(stewardshipEvolution: StewardshipEvolution | undefined) {
  if (stewardshipEvolution === undefined) return

  const { department, division, branch, unit } = stewardshipEvolution

  return ([department, division, branch, unit].filter(Boolean) as string[])
    .map(acronymize)
    .join("-")
}

function formatTags(tags: Tag[]) {
  return tags.map((tag) => tag.name).join(", ")
}

function formatAccess(access: string | undefined) {
  if (access === undefined) return

  return t(`access_grants.access_types.${access}`, access)
}

defineExpose({ refresh })
</script>
