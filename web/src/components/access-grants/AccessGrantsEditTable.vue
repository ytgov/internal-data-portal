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
    <template #item.grantLevel="{ value }">
      {{ formatGrantLevel(value) }}
    </template>
    <template #item.accessType="{ value }">
      {{ formatAccessType(value) }}
    </template>
    <template #item.supportId="{ value }">
      <template v-if="isNil(value)">
        <!-- No supporting user -->
      </template>
      <UserEmailChip
        v-else
        :user-id="value"
      />
    </template>
    <template #item.isProjectDescriptionRequired="{ value }">
      <div class="d-flex justify-center align-center">
        <v-chip :color="value ? 'success' : 'error'">{{ value ? "Yes" : "No" }}</v-chip>
      </div>
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
import { useI18n } from "vue-i18n"
import { isNil } from "lodash"

import useAccessGrants, { AccessGrant } from "@/use/use-access-grants"

import AccessGrantEditDialog from "@/components/access-grants/AccessGrantEditDialog.vue"
import AccessGrantDeleteDialog from "@/components/access-grants/AccessGrantDeleteDialog.vue"
import UserEmailChip from "@/components/users/UserEmailChip.vue"

const props = defineProps({
  datasetId: {
    type: Number,
    required: true,
  },
})

const headers = ref([
  { title: "Shared With", key: "grantLevel" },
  { title: "Access Type", key: "accessType" },
  { title: "Request Email", key: "supportId" },
  { title: "Project Desciption Required?", key: "isProjectDescriptionRequired" },
  { title: "", key: "actions" },
])

const route = useRoute()
const itemsPerPage = ref(10)
const page = ref(1)
const accessGrantsQuery = computed(() => ({
  where: {
    datasetId: props.datasetId,
  },
  perPage: itemsPerPage.value,
  page: page.value,
}))
const { accessGrants, totalCount, isLoading, refresh } = useAccessGrants(accessGrantsQuery)

const { t } = useI18n()

function formatGrantLevel(grantLevel: string | undefined) {
  if (grantLevel === undefined) return

  return t(`access_grants.grant_levels.${grantLevel}`, grantLevel)
}

function formatAccessType(accessType: string | undefined) {
  if (accessType === undefined) return

  return t(`access_grants.access_types.${accessType}`, accessType)
}

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

  const accessGrant = accessGrants.value.find((accessGrant) => accessGrant.id === accessGrantId)
  if (isNil(accessGrant)) return

  showEditDialog(accessGrant)
}

function showDeleteDialogForRouteQuery() {
  if (typeof route.query.showDelete !== "string") return

  const accessGrantId = parseInt(route.query.showDelete)
  if (isNaN(accessGrantId)) return

  const accessGrant = accessGrants.value.find((accessGrant) => accessGrant.id === accessGrantId)
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
