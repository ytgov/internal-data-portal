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
    <template #item.stewardshipEvolutions="{ value, item: { slug } }">
      {{ formatOwnership(value[0]) }}
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
      />
      <SubscribeToDatasetButton
        v-else-if="action === DatasetTableActions.SUBSCRIBE"
        class="action-buttons"
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
import { useI18n } from "vue-i18n"

import acronymize from "@/utils/acronymize"
import useDatasets, { type StewardshipEvolution } from "@/use/use-datasets"

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

defineExpose({ refresh })
</script>

<style scoped>
::v-deep td {
  position: relative;
}

::v-deep tr:hover,
tr:focus-within {
  background-color: rgba(0, 0, 0, 0.1);
}

.action-buttons {
  z-index: 1; /* Ensures buttons are above ColumnRouterLinks and are clickable */
}
</style>
