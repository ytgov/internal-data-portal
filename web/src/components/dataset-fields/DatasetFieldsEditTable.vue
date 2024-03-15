<template>
  <v-data-table-server
    v-model:items-per-page="itemsPerPage"
    v-model:page="page"
    :headers="headers"
    :items="datasetFields"
    :items-length="totalCount"
    :loading="isLoading"
    class="elevation-1"
  >
    <template #top>
      <DatasetFieldEditDialog
        ref="editDialog"
        @saved="refresh"
      />
      <DatasetFieldDeleteDialog
        ref="deleteDialog"
        @deleted="refresh"
      />
    </template>
    <template #item.actions="{ item }">
      <div class="d-flex justify-end align-center">
        <v-btn
          color="primary"
          variant="outlined"
          @click="showEditDialog(item)"
        >
          Edit
        </v-btn>
        <v-btn
          title="Delete"
          icon="mdi-delete"
          size="x-small"
          class="ml-2"
          color="error"
          variant="outlined"
          @click="showDeleteDialog(item)"
        ></v-btn>
      </div>
    </template>
  </v-data-table-server>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from "vue"
import { useRoute } from "vue-router"
import { isNil } from "lodash"

import useDatasetFields, { DatasetField } from "@/use/use-dataset-fields"

import DatasetFieldEditDialog from "@/components/dataset-fields/DatasetFieldEditDialog.vue"
import DatasetFieldDeleteDialog from "@/components/dataset-fields/DatasetFieldDeleteDialog.vue"

const props = defineProps({
  datasetId: {
    type: Number,
    required: true,
  },
})

const headers = ref([
  { title: "Field Name", key: "name" },
  { title: "Display Name", key: "displayName" },
  { title: "Field Description", key: "description" },
  { title: "Data Type", key: "dataType" },
  { title: "Notes", key: "note" },
  { title: "", key: "actions" },
])

const route = useRoute()
const itemsPerPage = ref(10)
const page = ref(1)
const datasetFieldsQuery = computed(() => ({
  where: {
    datasetId: props.datasetId,
  },
  perPage: itemsPerPage.value,
  page: page.value,
}))

const { datasetFields, totalCount, isLoading, refresh } = useDatasetFields(datasetFieldsQuery)

const editDialog = ref<InstanceType<typeof DatasetFieldEditDialog> | null>(null)
const deleteDialog = ref<InstanceType<typeof DatasetFieldDeleteDialog> | null>(null)

function showDeleteDialog(datasetField: DatasetField) {
  deleteDialog.value?.show(datasetField)
}

function showEditDialog(datasetField: DatasetField) {
  editDialog.value?.show(datasetField)
}

function showEditDialogForRouteQuery() {
  if (typeof route.query.showEdit !== "string") return

  const datasetFieldId = parseInt(route.query.showEdit)
  if (isNaN(datasetFieldId)) return

  const datasetField = datasetFields.value.find(
    (datasetField) => datasetField.id === datasetFieldId
  )
  if (isNil(datasetField)) return

  showEditDialog(datasetField)
}

function showDeleteDialogForRouteQuery() {
  if (typeof route.query.showDelete !== "string") return

  const datasetFieldId = parseInt(route.query.showDelete)
  if (isNaN(datasetFieldId)) return

  const datasetField = datasetFields.value.find(
    (datasetField) => datasetField.id === datasetFieldId
  )
  if (isNil(datasetField)) return

  showDeleteDialog(datasetField)
}

watch(
  () => datasetFields.value,
  (datasetFields) => {
    if (datasetFields.length === 0) return

    showEditDialogForRouteQuery()
    showDeleteDialogForRouteQuery()
  }
)

defineExpose({ refresh })
</script>
