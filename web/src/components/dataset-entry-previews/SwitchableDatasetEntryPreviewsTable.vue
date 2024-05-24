<template>
  <div class="d-flex justify-end">
    <v-switch
      v-model="showPreview"
      :label="showPreview ? 'Preview' : 'Full'"
      color="primary"
      inset
      hide-details
    />
  </div>
  <DatasetEntryPreviewsTable
    v-if="showPreview"
    ref="datasetEntryPreviewsTable"
    :dataset-id="datasetId"
    :visualization-control-id="visualizationControlId"
  />
  <DatasetEntriesTable
    v-else
    ref="datasetEntriesTable"
    :dataset-id="datasetId"
    :visualization-control-id="visualizationControlId"
  />
</template>

<script setup lang="ts">
import { isNil } from "lodash"
import { ref, watch } from "vue"
import { useRoute, useRouter } from "vue-router"

import DatasetEntriesTable from "@/components/dataset-entries/DatasetEntriesTable.vue"
import DatasetEntryPreviewsTable from "@/components/dataset-entry-previews/DatasetEntryPreviewsTable.vue"

defineProps({
  datasetId: {
    type: Number,
    required: true,
  },
  visualizationControlId: {
    type: Number,
    required: true,
  },
})

const route = useRoute()
const showPreview = ref(route.query.showPreview !== "false")

const router = useRouter()

watch(
  () => showPreview.value,
  (value) => {
    if (value === false) {
      router.push({ query: { showPreview: "false" } })
    } else {
      router.push({ query: { showPreview: undefined } })
    }
  }
)

const datasetEntryPreviewsTable = ref<InstanceType<typeof DatasetEntryPreviewsTable> | null>(null)
const datasetEntriesTable = ref<InstanceType<typeof DatasetEntriesTable> | null>(null)

function refresh() {
  if (showPreview.value) {
    if (isNil(datasetEntryPreviewsTable.value)) {
      return
    }

    datasetEntryPreviewsTable.value.refresh()
    return
  }

  if (isNil(datasetEntriesTable.value)) {
    return
  }

  datasetEntriesTable.value.refresh()
}

defineExpose({
  refresh,
})
</script>
