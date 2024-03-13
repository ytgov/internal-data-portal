<template>
  TODO: implement the UsersEditTable component
  <v-data-table-server
    v-model:items-per-page="itemsPerPage"
    v-model:page="page"
    :headers="headers"
    :items="users"
    :items-length="totalCount"
    :loading="isLoading"
    class="elevation-1"
  >
    <template #top>
      <UserEditDialog
        ref="editDialog"
        @saved="refresh"
      />
      <UserDeleteDialog
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

import useUsers, { User } from "@/use/use-users"

import UserEditDialog from "@/components/users/UserEditDialog.vue"
import UserDeleteDialog from "@/components/users/UserDeleteDialog.vue"
import { useI18n } from "vue-i18n"

const { t } = useI18n()

const headers = ref([
  { title: "Display Name", key: "displayName" },
  { title: "Email", key: "email" },
  { title: "Position", key: "position" },
  {
    title: "Department",
    key: "department",
    value: (item: unknown) => {
      const { department, division, branch, unit } = item as User
      return [department, division, branch, unit].filter(Boolean).join(' - ')
    },
  },
  {
    title: "Role",
    key: "roleTypes",
    value: (item: unknown) => {
      const { roleTypes } = item as User
      const formatedRoleTypes = roleTypes.map((roleType) =>
        t(`roles.role_types.${roleType}`, roleType)
      )
      return formatedRoleTypes.join(", ")
    },
  },
  { title: "", key: "actions" },
])

const route = useRoute()
const itemsPerPage = ref(10)
const page = ref(1)
const datasetsQuery = computed(() => ({
  perPage: itemsPerPage.value,
  page: page.value,
}))

const { users, totalCount, isLoading, refresh } = useUsers(datasetsQuery)

const editDialog = ref<InstanceType<typeof UserEditDialog> | null>(null)
const deleteDialog = ref<InstanceType<typeof UserDeleteDialog> | null>(null)

function showDeleteDialog(user: User) {
  deleteDialog.value?.show(user)
}

function showEditDialog(user: User) {
  editDialog.value?.show(user)
}

function showEditDialogForRouteQuery() {
  if (typeof route.query.showEdit !== "string") return

  const userId = parseInt(route.query.showEdit)
  if (isNaN(userId)) return

  const user = users.value.find((user) => user.id === userId)
  if (isNil(user)) return

  showEditDialog(user)
}

function showDeleteDialogForRouteQuery() {
  if (typeof route.query.showDelete !== "string") return

  const userId = parseInt(route.query.showDelete)
  if (isNaN(userId)) return

  const user = users.value.find((user) => user.id === userId)
  if (isNil(user)) return

  showDeleteDialog(user)
}

watch(
  () => users.value,
  (users) => {
    if (users.length === 0) return

    showEditDialogForRouteQuery()
    showDeleteDialogForRouteQuery()
  }
)

defineExpose({ refresh })
</script>
