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
    <template #item.name="{ value, item: { slug } }">
      {{ value }}
      <ColumnRouterLink
        :slug="slug"
        class="row-link"
        tabindex="0"
      />
    </template>
    <template #item.description="{ value, item: { slug } }">
      {{ value }}
      <ColumnRouterLink :slug="slug" />
    </template>
    <template #item.tags="{ value, item: { slug } }">
      {{ formatTags(value) }}
      <ColumnRouterLink :slug="slug" />
    </template>
    <template #item.stewardship="{ value, item: { slug } }">
      {{ formatOwnership(value) }}
      <ColumnRouterLink :slug="slug" />
    </template>
    <template #item.access="{ value, item: { slug } }">
      {{ formatAccess(value) }}
      <ColumnRouterLink :slug="slug" />
    </template>
    <template #item.actions="{ value: action, item: { slug } }">
      <RequestAccessButton
        v-if="action === DatasetTableActions.REQUEST_ACCESS"
        class="action-buttons"
        @mouseover="disableRowHighlight"
        @mouseleave="removeDisableRowHighlight"
      />
      <SubscribeToDatasetButton
        v-else-if="action === DatasetTableActions.SUBSCRIBE"
        class="action-buttons"
        @mouseover="disableRowHighlight"
        @mouseleave="removeDisableRowHighlight"
      />
      <template v-else>
        {{ formatAction(action) }}
      </template>
      <ColumnRouterLink :slug="slug" />
    </template>
  </v-data-table>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue"
import { compact, isNil } from "lodash"
import { useI18n } from "vue-i18n"

import acronymize from "@/utils/acronymize"
import { type DatasetStewardship } from "@/api/dataset-stewardships-api"
import useDatasets from "@/use/use-datasets"

import ColumnRouterLink from "@/components/datasets/datasets-table/ColumnRouterLink.vue"
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
  { title: "Owner", key: "stewardship" },
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

function formatOwnership(datasetStewardship: DatasetStewardship | undefined) {
  if (isNil(datasetStewardship)) return

  const { department, division, branch, unit } = datasetStewardship
  const userGroupNames = compact(
    [department, division, branch, unit].map((userGroup) => userGroup?.name)
  )
  return userGroupNames.map(acronymize).join("-")
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

function disableRowHighlight(event: MouseEvent) {
  const target = event.target as HTMLElement
  const row = target.closest("tr")

  if (row) {
    row.classList.add("no-highlight")
  }
}

function removeDisableRowHighlight(event: MouseEvent) {
  const target = event.target as HTMLElement
  const row = target.closest("tr")

  if (row) {
    row.classList.remove("no-highlight")
  }
}

defineExpose({ refresh })
</script>

<style scoped>
::v-deep(td) {
  position: relative;
}

::v-deep(tbody > tr:hover, tr:focus-within) {
  background-color: rgba(var(--v-theme-yg-blue), 0.1);
}

::v-deep(tbody > tr.no-highlight) {
  background-color: transparent !important;
}

.action-buttons {
  z-index: 1; /* Ensures buttons are above ColumnRouterLinks and are clickable */
}
</style>
