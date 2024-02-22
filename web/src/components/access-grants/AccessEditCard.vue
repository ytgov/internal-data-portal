<template>
  <v-card>
    <v-card-title class="d-flex justify-space-between align-end">
      Access
      <AccessGrantCreateDialog
        :dataset-id="dataset?.id"
        @created="refreshTable"
      />
    </v-card-title>
    <v-card-text>
      <v-skeleton-loader
        v-if="isNil(dataset)"
        type="table"
      />
      <AccessGrantsEditTable
        v-else
        ref="accessGrantsTable"
        :dataset-id="dataset.id"
      />
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, toRefs } from "vue"
import { isNil } from "lodash"

import useDataset from "@/use/use-dataset"

import AccessGrantCreateDialog from "@/components/access-grants/AccessGrantCreateDialog.vue"
import AccessGrantsEditTable from "@/components/access-grants/AccessGrantsEditTable.vue"

const props = defineProps({
  slug: {
    type: String,
    required: true,
  },
})

const { slug } = toRefs(props)
const { dataset } = useDataset(slug)

const accessGrantsTable = ref<InstanceType<typeof AccessGrantsEditTable> | null>(null)

function refreshTable() {
  accessGrantsTable.value?.refresh()
}
</script>
