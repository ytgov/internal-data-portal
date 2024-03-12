<template>
  <v-skeleton-loader v-if="isNil(currentUser)" />
  <v-container v-else>
    <h2 class="d-flex flex-column flex-md-row justify-space-between mb-3">
      My Profile

      <div class="d-flex justify-space-between mt-4 mb-3 my-md-0">
        <v-btn
          color="primary"
          variant="outlined"
          :to="{ name: 'ProfilePage' }"
        >
          Back
        </v-btn>
        <v-btn
          class="ml-md-3"
          title="Sync profile with external directory"
          color="primary"
          append-icon="mdi-sync"
          @click="sync"
        >
          Sync
        </v-btn>
      </div>
    </h2>

    <v-row>
      <v-col
        cols="12"
        md="6"
      >
        <v-text-field
          :model-value="currentUser.firstName"
          label="First name"
          variant="outlined"
        />
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <v-text-field
          :model-value="currentUser.lastName"
          label="Last name"
          variant="outlined"
        />
      </v-col>
    </v-row>

    <v-row>
      <v-col
        cols="12"
        md="6"
      >
        <v-text-field
          :model-value="currentUser.email"
          label="Email"
          variant="outlined"
        />
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <v-text-field
          :model-value="currentUser.position"
          label="Position"
          variant="outlined"
        />
      </v-col>
    </v-row>

    <v-divider class="my-6"></v-divider>

    <v-row>
      <v-col
        cols="12"
        md="6"
      >
        <UserGroupAutocomplete
          :model-value="groupMembershipAttributes.departmentId"
          :type="UserGroupTypes.DEPARTMENT"
          :parent-id="null"
          :rules="[required]"
          label="Department"
          variant="outlined"
          required
          @update:model-value="updateDepartment"
        />
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <UserGroupAutocomplete
          :model-value="groupMembershipAttributes.divisionId"
          :type="UserGroupTypes.DIVISION"
          :parent-id="groupMembershipAttributes.departmentId"
          :disabled="isNil(groupMembershipAttributes.departmentId)"
          label="Division"
          variant="outlined"
          clearable
          @update:model-value="updateDivision"
        />
      </v-col>
    </v-row>

    <v-row>
      <v-col
        cols="12"
        md="6"
      >
        <UserGroupAutocomplete
          :model-value="groupMembershipAttributes.branchId"
          :type="UserGroupTypes.BRANCH"
          :parent-id="groupMembershipAttributes.divisionId"
          :disabled="isNil(groupMembershipAttributes.divisionId)"
          label="Branch"
          variant="outlined"
          clearable
          @update:model-value="updateBranch"
        />
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <UserGroupAutocomplete
          :model-value="groupMembershipAttributes.unitId"
          :type="UserGroupTypes.UNIT"
          :parent-id="groupMembershipAttributes.branchId"
          :disabled="isNil(groupMembershipAttributes.branchId)"
          label="Unit"
          variant="outlined"
          clearable
          @update:model-value="updateUnit"
        />
      </v-col>
    </v-row>

    <v-row>
      <v-col
        cols="12"
        md="6"
      >
        <h3 class="mb-1">Roles</h3>

        <v-chip
          v-for="(roleType, index) in currentUser.roleTypes"
          :key="index"
          class="ma-2"
          color="info"
          size="large"
        >
          {{ formatRole(roleType) }}
        </v-chip>
      </v-col>
    </v-row>
    <v-row>
      <v-spacer />
      <v-col class="d-flex justify-end">
        <v-btn
          color="error"
          variant="outlined"
          :to="{ name: 'ProfilePage' }"
        >
          Cancel
        </v-btn>
        <!-- TODO: add ability to request update of yukon government directory information during save -->
        <v-btn
          class="ml-md-3"
          color="success"
          @click="saveWrapper"
        >
          Save
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { isNil } from "lodash"
import { useI18n } from "vue-i18n"
import { ref, watch } from "vue"

import { required } from "@/utils/validators"
import { GroupMembership } from "@/api/users-api"
import { UserGroupTypes } from "@/api/user-groups-api"
import { useBreadcrumbs } from "@/use/use-breadcrumbs"
import { useCurrentUser } from "@/use/use-current-user"

import UserGroupAutocomplete from "@/components/user-groups/UserGroupAutocomplete.vue"

const { currentUser, save, sync } = useCurrentUser()

async function saveWrapper() {
  return save(groupMembershipAttributes.value)
}

const groupMembershipAttributes = ref<Partial<GroupMembership>>({})

watch(
  () => currentUser.value,
  (newCurrentUser) => {
    if (isNil(newCurrentUser)) return

    const { groupMembership } = newCurrentUser
    const { departmentId, divisionId, branchId, unitId } = groupMembership

    groupMembershipAttributes.value = {
      departmentId,
      divisionId,
      branchId,
      unitId,
    }
  },
  {
    deep: true,
    immediate: true,
  }
)

function clearDivision() {
  groupMembershipAttributes.value.divisionId = null
  clearBranch()
}

function clearBranch() {
  groupMembershipAttributes.value.branchId = null
  clearUnit()
}

function clearUnit() {
  groupMembershipAttributes.value.unitId = null
}

async function updateDepartment(newDepartmentId: number | null) {
  if (isNil(newDepartmentId)) {
    throw new Error("Department id is required")
  }

  groupMembershipAttributes.value.departmentId = newDepartmentId
  clearDivision()
}

async function updateDivision(newDivisionId: number | null) {
  if (isNil(newDivisionId)) {
    clearDivision()
    return
  }

  groupMembershipAttributes.value.divisionId = newDivisionId
  clearBranch()
}

async function updateBranch(newBranchId: number | null) {
  if (isNil(newBranchId)) {
    clearBranch()
    return
  }

  groupMembershipAttributes.value.branchId = newBranchId
  clearUnit()
}

async function updateUnit(newUnitId: number | null) {
  if (isNil(newUnitId)) {
    clearUnit()
    return
  }

  groupMembershipAttributes.value.unitId = newUnitId
}

const { t } = useI18n()

function formatRole(roleType: string) {
  return t(`roles.role_types.${roleType}`, roleType)
}

const { setBreadcrumbs } = useBreadcrumbs()

setBreadcrumbs([
  {
    title: "Profile",
    to: { name: "ProfilePage" },
  },
  {
    title: "Edit",
    to: { name: "ProfileEditPage" },
  },
])
</script>
