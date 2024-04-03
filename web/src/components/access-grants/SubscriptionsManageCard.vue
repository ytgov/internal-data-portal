<template>
  <v-card>
    <v-card-title class="d-flex justify-space-between align-end">
      Subscriptions

      <v-progress-circular
        v-if="isNil(dataset)"
        color="primary"
        size="24"
        width="2"
        indeterminate
      />
      <EmailUsersDialog
        v-else
        :dataset-id="dataset.id"
        :dataset-name="dataset.name"
      />
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
import EmailUsersDialog from "@/components/users/EmailUsersDialog.vue"

const props = defineProps({
  slug: {
    type: String,
    required: true,
  },
})

const { slug } = toRefs(props)
const { dataset } = useDataset(slug)
</script>
