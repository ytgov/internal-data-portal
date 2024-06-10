<template>
  <v-data-table-server
    v-model:items-per-page="itemsPerPage"
    :page="page"
    :headers="headers"
    :items="datasets"
    :items-length="totalCount"
    :loading="isLoading"
    class="elevation-1"
    @update:page="updatePage"
  >
    <template #top>
      <v-row class="ma-1">
        <v-col
          cols="12"
          md="4"
        >
          <TagsAutocomplete
            :model-value="tagNames"
            label="Search"
            variant="outlined"
            clearable
            persistent-clear
            @update:model-value="updateWithTagNamesFilterQuery"
            @click:clear="clearSearchQuery"
          />
        </v-col>
        <v-col class="d-none d-md-flex justify-end align-center">
          <v-btn
            icon="mdi-cached"
            color="primary"
            variant="outlined"
            size="x-small"
            title="Refresh Datasets"
            @click="refresh"
          />
        </v-col>
      </v-row>
    </template>
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
        :slug="slug"
        class="action-buttons"
        @mouseover="disableRowHighlight"
        @mouseleave="removeDisableRowHighlight"
      />
      <SubscribeToDatasetButton
        v-else-if="action === DatasetTableActions.SUBSCRIBE"
        :slug="slug"
        class="action-buttons"
        @mouseover="disableRowHighlight"
        @mouseleave="removeDisableRowHighlight"
      />
      <template v-else>
        {{ formatAction(action) }}
      </template>
      <ColumnRouterLink :slug="slug" />
    </template>
  </v-data-table-server>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from "vue"
import { useRoute, useRouter, type LocationQueryValue } from "vue-router"
import { cloneDeep, compact, isNil } from "lodash"
import { useI18n } from "vue-i18n"

import { type DatasetStewardship } from "@/api/dataset-stewardships-api"
import useDatasets from "@/use/use-datasets"

import ColumnRouterLink from "@/components/datasets/datasets-table/ColumnRouterLink.vue"
import RequestAccessButton from "@/components/datasets/datasets-table/RequestAccessButton.vue"
import SubscribeToDatasetButton from "@/components/datasets/datasets-table/SubscribeToDatasetButton.vue"
import TagsAutocomplete from "@/components/tags/TagsAutocomplete.vue"
import { DatasetsFilters } from "@/api/datasets-api"

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

const route = useRoute()
const router = useRouter()

const itemsPerPage = ref(parseInt(route.query.perPage as string) || 10)
const page = ref(parseInt(route.query.page as string) || 1)
const tagNames = computed(() => (route.query.filters as unknown as DatasetsFilters)?.withTagNames)

function updatePage(newPage: number) {
  if (isLoading.value) return

  page.value = newPage
}

watch(
  () => [itemsPerPage.value, page.value],
  ([newPerPage, newPage]) => {
    const { query } = route
    router.push({
      query: {
        ...query,
        perPage: newPerPage,
        page: newPage,
      },
    })
  },
  {
    immediate: true,
  }
)

const datasetsQuery = computed(() => ({
  filters: route.query.filters as unknown as Record<string, unknown> | undefined,
  perPage: itemsPerPage.value,
  page: page.value,
}))
const { datasets, isLoading, totalCount, fetch: refresh } = useDatasets(datasetsQuery)

function updateWithTagNamesFilterQuery(newTagNames: string[]) {
  const query = cloneDeep(route.query)

  if (isNil(query.filters)) {
    query.filters = {
      withTagNames: newTagNames,
    } as unknown as LocationQueryValue
  } else {
    ;(query.filters as DatasetsFilters).withTagNames = newTagNames
  }

  router.push({
    query,
  })
}

function clearSearchQuery() {
  router.push({ query: { ...route.query, filters: undefined } })
}

function formatOwnership(datasetStewardship: DatasetStewardship | undefined) {
  if (isNil(datasetStewardship)) return

  const { department, division, branch, unit } = datasetStewardship
  const userGroupAcronyms = compact([department, division, branch, unit]).map(
    (userGroup) => userGroup.acronym
  )
  return userGroupAcronyms.join("-")
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
