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
    <template #item.actions="{ item }">
      <v-btn
        v-if="item.status === 'access_granted'"
        color="error"
        variant="outlined"
        @click="showRevokeDialog(item)"
      >
        Revoke
      </v-btn>
      <div
        v-else-if="item.status === 'access_pending'"
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

import useAccessRequests, { AccessRequest } from "@/use/use-access-requests"

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
  { title: "First Name", key: "requestorId" },
  { title: "Last Name", key: "requestorId" },
  // Department through User -> UserGroupMembership#departmentId -> UserGroup#name
  { title: "Department", key: "requestorId" },
  { title: "Use", key: "projectDescription" },
  // Access Type through AccessRequest#accessGrantId -> AccessGrant#accessType
  { title: "Access Type", key: "accessType" },
  // Status generated from approvedAt/deniedAt
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

const revokeDialog = ref<InstanceType<typeof AccessRequestRevokeDialog> | null>(null)
const approveDialog = ref<InstanceType<typeof AccessRequestApproveDialog> | null>(null)
const denyDialog = ref<InstanceType<typeof AccessRequestDenyDialog> | null>(null)

function showRevokeDialog(accessRequest: AccessRequest) {
  revokeDialog.value?.show(accessRequest)
}

function showDenyDialog(accessRequest: AccessRequest) {
  denyDialog.value?.show(accessRequest)
}

function showApproveDialog(accessRequest: AccessRequest) {
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
