<template>
  <v-card>
    <v-card-title>My Subscriptions</v-card-title>
    <v-card-text>
      <v-data-table-server
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

const { currentUser, isLoading: isLoadingCurrentUser } = useCurrentUser()

const itemsPerPage = ref(10)
const page = ref(1)
const accessRequestsQuery = computed(() => ({
  where: {
    requestorId: currentUser.value?.id,
    // TODO: the user might want these to be shown?
    revokedAt: null,
    deniedAt: null,
  },
  perPage: itemsPerPage.value,
  page: page.value,
}))
const {
  accessRequests,
  totalCount,
  isLoading: isLoadingAccessRequests,
} = useAccessRequests(accessRequestsQuery, {
  skipWatchIf: () => isNil(currentUser.value),
})

const isLoading = computed(() => isLoadingAccessRequests.value || isLoadingCurrentUser.value)
</script>
