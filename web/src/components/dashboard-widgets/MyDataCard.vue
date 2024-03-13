<template>
  <v-card>
    <v-card-title>My Data</v-card-title>
    <v-card-text>
      <v-data-table-server
        v-model:items-per-page="itemsPerPage"
        v-model:page="page"
        :headers="headers"
        :items="datasets"
        :items-length="totalCount"
        :items-per-page-options="itemsPerPageOptions"
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

import useDatasets, { Dataset } from "@/use/use-datasets"
import useCurrentUser from "@/use/use-current-user"

const { t } = useI18n()

const headers = ref([
  { title: "Dataset", key: "name" },
  {
    title: "Data Status",
    key: "integration.status",
    value: (item: unknown) => {
      const { integration } = item as Dataset
      if (integration === undefined) return "OK"

      const { status } = integration
      if (status === undefined) return "Errored"

      return t(`dataset_integrations.status_types.${status}`, status)
    },
  },
  {
    // TODO: implement error code tracking in back-end
    title: "Error Code",
    key: "integration.status",
    value: (item: unknown) => {
      const { integration } = item as Dataset
      if (integration === undefined) return ""

      const { errorCode } = integration
      if (isNil(errorCode)) return ""

      return errorCode
    },
  },
])

const { currentUser, isLoading: isLoadingCurrentUser } = useCurrentUser()

const itemsPerPage = ref(3)
const page = ref(1)
const itemsPerPageOptions = [
  { value: 3, title: "3" },
  { value: 5, title: "5" },
  { value: 10, title: "10" },
  { value: -1, title: "$vuetify.dataFooter.itemsPerPageAll" },
]
const datasetsQuery = computed(() => ({
  where: {
    ownerId: currentUser.value?.id,
  },
  perPage: itemsPerPage.value,
  page: page.value,
}))
const {
  datasets,
  totalCount,
  isLoading: isLoadingAccessRequests,
} = useDatasets(datasetsQuery, {
  skipWatchIf: () => isNil(currentUser.value),
})

const isLoading = computed(() => isLoadingAccessRequests.value || isLoadingCurrentUser.value)
</script>
