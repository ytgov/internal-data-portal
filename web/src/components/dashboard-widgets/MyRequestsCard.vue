<template>
  <v-card>
    <v-card-title>My Requests</v-card-title>
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
        <template #top>
          <AccessRequestApproveDialog
            ref="approveDialog"
            @approved="refresh"
          />
          <AccessRequestDenyDialog
            ref="denyDialog"
            @denied="refresh"
          />
        </template>
        <template #item.actions="{ item }">
          <div
            v-if="item.status === AccessRequestTableStatuses.ACCESS_REQUESTED"
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
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from "vue"
import { isNil } from "lodash"
import { useRoute } from "vue-router"

import useAccessRequests, {
  AccessRequestTableView,
  AccessRequestTableStatuses,
} from "@/use/use-access-requests"
import useCurrentUser from "@/use/use-current-user"

import AccessRequestApproveDialog from "@/components/access-requests/AccessRequestApproveDialog.vue"
import AccessRequestDenyDialog from "@/components/access-requests/AccessRequestDenyDialog.vue"

const headers = ref([
  { title: "Dataset", key: "dataset.name" },
  { title: "Department", key: "requestorDepartmentName" },
  {
    title: "Name",
    key: "requestorFullName",
    value: (item: unknown) => {
      const { requestorFirstName, requestorLastName } = item as AccessRequestTableView
      const fullName = [requestorFirstName, requestorLastName].filter(Boolean).join(" ")
      return fullName
    },
  },
  { title: "On behalf of", key: "projectName" },
  { title: "Description", key: "projectDescription" },
  { title: "", key: "actions" },
])

const { currentUser, isLoading: isLoadingCurrentUser } = useCurrentUser()

const route = useRoute()
const itemsPerPage = ref(10)
const page = ref(1)
const accessRequestsQuery = computed(() => ({
  where: {
    approvedAt: null,
    deniedAt: null,
  },
  filters: {
    withDatasetOwnerId: currentUser.value?.id,
  },
  perPage: itemsPerPage.value,
  page: page.value,
}))
const {
  accessRequests,
  totalCount,
  isLoading: isLoadingAccessRequests,
  refresh,
} = useAccessRequests(accessRequestsQuery, {
  skipWatchIf: () => isNil(currentUser.value),
})

const isLoading = computed(() => isLoadingAccessRequests.value || isLoadingCurrentUser.value)

const approveDialog = ref<InstanceType<typeof AccessRequestApproveDialog> | null>(null)
const denyDialog = ref<InstanceType<typeof AccessRequestDenyDialog> | null>(null)

function showDenyDialog(accessRequest: AccessRequestTableView) {
  denyDialog.value?.show(accessRequest)
}

function showApproveDialog(accessRequest: AccessRequestTableView) {
  approveDialog.value?.show(accessRequest)
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
  (newAccessRequests) => {
    if (newAccessRequests.length === 0) return

    showApproveDialogForRouteQuery()
    showDenyDialogForRouteQuery()
  }
)
</script>
