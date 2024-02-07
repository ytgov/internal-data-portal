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
    <!-- <template #item>
      TODO: implement link wrapping rows
    </template> -->
    <template #item.stewardshipEvolutions="{ value }">
      {{ formatOwnership(value[0]) }}
    </template>
    <template #item.tags="{ value }">
      {{ formatTags(value) }}
    </template>
    <template #item.access="{ value }">
      {{ formatAccess(value) }}
    </template>
    <template #item.actions="{ value: action }">
      <RequestAccessButton v-if="action === DatasetTableActions.REQUEST_ACCESS" />
      <SubscribeToDatasetButton v-else-if="action === DatasetTableActions.SUBSCRIBE" />
      <template v-else>
        {{ formatAction(action) }}
      </template>
    </template>
  </v-data-table>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue"
import { useI18n } from "vue-i18n"

import acronymize from "@/utils/acronymize"
import useDatasets, { type StewardshipEvolution } from "@/use/use-datasets"

import RequestAccessButton from "@/components/datasets/datasets-table/RequestAccessButton.vue"
import SubscribeToDatasetButton from "@/components/datasets/datasets-table/SubscribeToDatasetButton.vue"

type Tag = {
  id: number
  name: string
  createdAt: string
  updatedAt: string
}

// Keep in sync with api/src/serializers/datasets/table-helpers/determine-actions.ts
enum DatasetTableActions {
  REQUEST_ACCESS = "request_access",
  SUBSCRIBED = "subscribed",
  APPROVED = "approved",
  SUBSCRIBE = "subscribe",
  AWAITING_APPROVAL = "awaiting_approval",
}

const { t } = useI18n()

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

function formatAction(action: string | undefined) {
  if (action === undefined) return

  return t(`datasets.datasets_table.actions.${action}`, action)
}

function goToDataset(dataset: any) {
  console.log("goToDataset", dataset)
}

defineExpose({ refresh })
</script>
