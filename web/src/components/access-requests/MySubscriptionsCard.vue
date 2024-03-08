<template>
  <v-card>
    <v-card-title>My Subscriptions</v-card-title>
    <v-card-text>
      <v-skeleton-loader
        v-if="isNil(currentUser)"
        type="card"
        boilerplate
      />
      <v-data-table-server
        v-else
        v-model:items-per-page="itemsPerPage"
        v-model:page="page"
        :headers="headers"
        :items="accessRequests"
        :items-length="totalCount"
        :loading="isLoading"
        class="elevation-1"
      >
      </v-data-table-server>
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue"
import { useI18n } from "vue-i18n"
import { isNil } from "lodash"

import useAccessRequests, { AccessRequestTableView } from "@/use/use-access-requests"
import useCurrentUser from "@/use/use-current-user"

const { t } = useI18n()

const headers = ref([
  { title: "Dataset", key: "dataset.name" },
  { title: "Description", key: "dataset.description" },
  {
    title: "Data Status",
    key: "dataset.integration.status",
    value: (item: unknown) => {
      const { dataset } = item as AccessRequestTableView
      if (dataset === undefined) return

      const { integration } = dataset
      if (integration === undefined) return "OK"

      const { status } = integration
      if (status === undefined) return "Errored"

      return t(`dataset_integrations.status_types.${status}`, status)
    },
  },
  {
    title: "Request Status",
    key: "status",
    value: (item: unknown) => {
      const { status } = item as AccessRequestTableView
      if (status === undefined) return

      return t(`access_requests.statuses.${status}`, status)
    },
  },
])

const { currentUser } = useCurrentUser()

const itemsPerPage = ref(10)
const page = ref(1)
const datasetsQuery = computed(() => ({
  where: {
    // TODO: check if I need to wait for currentUser before sending this query
    requestorId: currentUser.value?.id,
    // TODO: the user might want these to be shown?
    revokedAt: null,
    deniedAt: null,
  },
  perPage: itemsPerPage.value,
  page: page.value,
}))
const { accessRequests, totalCount, isLoading } = useAccessRequests(datasetsQuery)
</script>
