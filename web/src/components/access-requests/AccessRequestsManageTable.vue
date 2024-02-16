<template>
  <v-data-table-server
    v-model:items-per-page="itemsPerPage"
    v-model:page="page"
    :headers="headers"
    :items="accessRequests"
    :items-length="totalCount"
    :loading="isLoading"
    class="elevation-1"
  >
    <template #top>
      <AccessRequestRevokeDialog
        ref="revokeDialog"
        @revoked="refresh"
      />
      <AccessRequestApproveDialog
        ref="approveDialog"
        @saved="refresh"
      />
      <AccessRequestDenyDialog
        ref="denyDialog"
        @deleted="refresh"
      />
    </template>
    <template #item.accessType="{ value }">
      {{ formatAccessType(value) }}
    </template>
    <template #item.status="{ value }">
      {{ formatStatus(value) }}
    </template>
    <template #item.actions="{ item }">
      <v-btn
        v-if="item.status === AccessRequestTableStatuses.ACCESS_GRANTED"
        color="error"
        variant="outlined"
        @click="showRevokeDialog(item)"
      >
        Revoke
      </v-btn>
      <div
        v-else-if="item.status === AccessRequestTableStatuses.ACCESS_REQUESTED"
        class="d-flex justify-end align-center"
      >
        <v-btn
          color="success"
          @click="showApproveDialog(item)"
        >
          Approve
        </v-btn>
        <v-btn
          class="ml-2"
          color="error"
          variant="outlined"
          @click="showDenyDialog(item)"
        >
          Deny
        </v-btn>
      </div>
      <template v-else>
        <!-- No actions -->
      </template>
    </template>
  </v-data-table-server>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from "vue"
import { useRoute } from "vue-router"
import { useI18n } from "vue-i18n"
import { isNil } from "lodash"

import useAccessRequests, {
  type AccessRequestTableView,
  AccessRequestTableStatuses,
} from "@/use/use-access-requests"

import AccessRequestRevokeDialog from "@/components/access-requests/AccessRequestRevokeDialog.vue"
import AccessRequestApproveDialog from "@/components/access-requests/AccessRequestApproveDialog.vue"
import AccessRequestDenyDialog from "@/components/access-requests/AccessRequestDenyDialog.vue"

const props = defineProps({
  datasetId: {
    type: Number,
    required: true,
  },
})

const headers = ref([
  { title: "First Name", key: "requestorFirstName" },
  { title: "Last Name", key: "requestorLastName" },
  { title: "Department", key: "requestorDepartmentName" },
  { title: "Use", key: "projectDescription" },
  { title: "Access Type", key: "accessType" },
  { title: "Status", key: "status" },
  { title: "License", key: "accessCode" },
  { title: "", key: "actions" },
])

const route = useRoute()
const itemsPerPage = ref(10)
const page = ref(1)
const datasetsQuery = computed(() => ({
  where: {
    datasetId: props.datasetId,
    revokedAt: null,
    deniedAt: null,
  },
  perPage: itemsPerPage.value,
  page: page.value,
}))
const { accessRequests, totalCount, isLoading, refresh } = useAccessRequests(datasetsQuery)

const { t } = useI18n()

function formatAccessType(accessType: string | undefined) {
  if (accessType === undefined) return

  return t(`access_grants.access_types.${accessType}`, accessType)
}

function formatStatus(status: string | undefined) {
  if (status === undefined) return

  return t(`access_requests.statuses.${status}`, status)
}

const revokeDialog = ref<InstanceType<typeof AccessRequestRevokeDialog> | null>(null)
const approveDialog = ref<InstanceType<typeof AccessRequestApproveDialog> | null>(null)
const denyDialog = ref<InstanceType<typeof AccessRequestDenyDialog> | null>(null)

function showRevokeDialog(accessRequest: AccessRequestTableView) {
  revokeDialog.value?.show(accessRequest)
}

function showDenyDialog(accessRequest: AccessRequestTableView) {
  denyDialog.value?.show(accessRequest)
}

function showApproveDialog(accessRequest: AccessRequestTableView) {
  approveDialog.value?.show(accessRequest)
}

function showRevokeDialogForRouteQuery() {
  if (typeof route.query.showRevoke !== "string") return

  const accessRequestId = parseInt(route.query.showRevoke)
  if (isNaN(accessRequestId)) return

  const accessRequest = accessRequests.value.find(
    (accessRequest) => accessRequest.id === accessRequestId
  )
  if (isNil(accessRequest)) return

  showRevokeDialog(accessRequest)
}

function showApproveDialogForRouteQuery() {
  if (typeof route.query.showApprove !== "string") return

  const accessRequestId = parseInt(route.query.showApprove)
  if (isNaN(accessRequestId)) return

  const accessRequest = accessRequests.value.find(
    (accessRequest) => accessRequest.id === accessRequestId
  )
  if (isNil(accessRequest)) return

  showApproveDialog(accessRequest)
}

function showDenyDialogForRouteQuery() {
  if (typeof route.query.showDeny !== "string") return

  const accessRequestId = parseInt(route.query.showDeny)
  if (isNaN(accessRequestId)) return

  const accessRequest = accessRequests.value.find(
    (accessRequest) => accessRequest.id === accessRequestId
  )
  if (isNil(accessRequest)) return

  showDenyDialog(accessRequest)
}

watch(
  () => accessRequests.value,
  (accessRequests) => {
    if (accessRequests.length === 0) return

    showRevokeDialogForRouteQuery()
    showApproveDialogForRouteQuery()
    showDenyDialogForRouteQuery()
  }
)

defineExpose({ refresh })
</script>
