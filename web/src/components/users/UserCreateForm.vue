<template>
  <v-form
    v-model="isValid"
    @submit.prevent="saveWrapper"
  >
    <v-row>
      <v-col
        cols="12"
        md="6"
      >
        <v-text-field
          v-model="userAttributes.firstName"
          label="First name *"
          :rules="[required]"
          variant="outlined"
          required
        />
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <v-text-field
          v-model="userAttributes.lastName"
          label="Last name *"
          :rules="[required]"
          variant="outlined"
          required
        />
      </v-col>
    </v-row>

    <v-row>
      <v-col
        cols="12"
        md="6"
      >
        <v-text-field
          v-model="userAttributes.email"
          label="Email *"
          :rules="[required]"
          variant="outlined"
          required
        />
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <v-text-field
          v-model="userAttributes.position"
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
          label="Department *"
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
        <h3>Roles</h3>

        <RoleTypeSelect
          v-model="roleType"
          label="Role *"
          :rules="[required]"
          class="mt-6"
          variant="outlined"
          required
        />
      </v-col>
    </v-row>
    <v-row>
      <v-spacer />
      <v-col class="d-flex justify-end">
        <v-btn
          :loading="isLoading"
          color="error"
          variant="outlined"
          :to="{ name: 'UsersPage' }"
        >
          Cancel
        </v-btn>
        <v-btn
          class="ml-3"
          :loading="isLoading"
          type="submit"
          color="success"
        >
          Create
        </v-btn>
      </v-col>
    </v-row>
  </v-form>
</template>

<script setup lang="ts">
import { isNil } from "lodash"
import { ref } from "vue"

import { required } from "@/utils/validators"
import usersApi, { type GroupMembership, type User, RoleTypes } from "@/api/users-api"
import { UserGroupTypes } from "@/api/user-groups-api"
import useSnack from "@/use/use-snack"

import UserGroupAutocomplete from "@/components/user-groups/UserGroupAutocomplete.vue"
import RoleTypeSelect from "@/components/roles/RoleTypeSelect.vue"

const snack = useSnack()

const userAttributes = ref<Partial<User>>({})
const groupMembershipAttributes = ref<Partial<GroupMembership>>({})
const isLoading = ref(false)
const isValid = ref(false)
const roleType = ref<RoleTypes>(RoleTypes.USER)

async function saveWrapper() {
  if (!isValid.value) {
    snack.notify("Please fill out all required fields", { color: "error" })
    return
  }

  try {
    await usersApi.create({
      ...userAttributes.value,
      groupMembershipAttributes: groupMembershipAttributes.value,
      rolesAttributes: [{ role: roleType.value }],
    })
  } catch (error) {
    snack.notify("Failed to create user", { color: "error" })
    throw error
  }
}

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
</script>
