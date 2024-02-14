<template>
  <v-data-table-server
    v-model:items-per-page="itemsPerPage"
    v-model:page="page"
    :headers="headers"
    :items="accessGrants"
    :items-length="totalCount"
    :loading="isLoading"
    class="elevation-1"
  >
    <template #top>
      <AccessGrantEditDialog
        ref="editDialog"
        @saved="refresh"
      />
      <AccessGrantDeleteDialog
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

import useAccessGrants, { AccessGrant } from "@/use/use-access-grants"

import AccessGrantEditDialog from "@/components/access-grants/AccessGrantEditDialog.vue"
import AccessGrantDeleteDialog from "@/components/access-grants/AccessGrantDeleteDialog.vue"

const props = defineProps({
  datasetId: {
    type: Number,
    required: true,
  },
})

const headers = ref([
  { title: "Shared with", key: "grantLevel" },
  { title: "Access Type", key: "accessType" },
  { title: "Request Email", key: "requestorId" },
  { title: "Project Desciption Required?", key: "projectDescriptionRequired" },
  { title: "", key: "actions" },
])

const route = useRoute()
const itemsPerPage = ref(10)
const page = ref(1)
const datasetsQuery = computed(() => ({
  where: {
    datasetId: props.datasetId,
  },
  perPage: itemsPerPage.value,
  page: page.value,
}))

const { accessGrants, totalCount, isLoading, refresh } = useAccessGrants(datasetsQuery)

const editDialog = ref<InstanceType<typeof AccessGrantEditDialog> | null>(null)
const deleteDialog = ref<InstanceType<typeof AccessGrantDeleteDialog> | null>(null)

function showDeleteDialog(accessGrant: AccessGrant) {
  deleteDialog.value?.show(accessGrant)
}

function showEditDialog(accessGrant: AccessGrant) {
  editDialog.value?.show(accessGrant)
}

function showEditDialogForRouteQuery() {
  if (typeof route.query.showEdit !== "string") return

  const accessGrantId = parseInt(route.query.showEdit)
  if (isNaN(accessGrantId)) return

  const accessGrant = accessGrants.value.find(
    (accessGrant) => accessGrant.id === accessGrantId
  )
  if (isNil(accessGrant)) return

  showEditDialog(accessGrant)
}

function showDeleteDialogForRouteQuery() {
  if (typeof route.query.showDelete !== "string") return

  const accessGrantId = parseInt(route.query.showDelete)
  if (isNaN(accessGrantId)) return

  const accessGrant = accessGrants.value.find(
    (accessGrant) => accessGrant.id === accessGrantId
  )
  if (isNil(accessGrant)) return

  showDeleteDialog(accessGrant)
}

watch(
  () => accessGrants.value,
  (accessGrants) => {
    if (accessGrants.length === 0) return

    showEditDialogForRouteQuery()
    showDeleteDialogForRouteQuery()
  }
)

defineExpose({ refresh })
</script>
