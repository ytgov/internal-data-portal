<template>
  <v-card>
    <v-card-title class="d-flex justify-space-between align-center">
      Owner
      <SaveStateProgress
        :saving="isLoading"
        @click="saveAndNotify"
      />
    </v-card-title>

    <v-card-text>
      <!-- TODO: make the skeleton loader an external component that matches the form -->
      <v-skeleton-loader
        v-if="isNil(datasetStewardship)"
        type="card"
      />
      <v-form
        v-else
        class="d-flex flex-column mt-6"
      >
        <v-row>
          <v-col
            cols="12"
            md="6"
          >
            <!-- TODO: enforce owner as current user if data_owner type -->
            <v-autocomplete
              :model-value="datasetStewardship.ownerId"
              :items="users"
              :rules="[required]"
              label="Owner Name *"
              item-value="id"
              item-title="displayName"
              variant="outlined"
              auto-select-first
              required
              @update:model-value="updateOwner($event as unknown as number | null)"
            >
              <template #no-data>
                <v-list-item>
                  <v-btn block> TODO: Create New User </v-btn>
                </v-list-item>
              </template>
            </v-autocomplete>
          </v-col>
          <v-col
            cols="12"
            md="6"
          >
            <v-autocomplete
              :model-value="datasetStewardship.ownerId"
              :items="users"
              :disabled="datasetStewardship.ownerId === undefined"
              :rules="[required]"
              label="Owner Position *"
              item-value="id"
              item-title="position"
              variant="outlined"
              auto-select-first
              required
              @update:model-value="updateOwner($event as unknown as number | null)"
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col
            cols="12"
            md="6"
          >
            <v-autocomplete
              :model-value="datasetStewardship.supportId"
              :items="users"
              :rules="[required]"
              label="Support Name *"
              item-value="id"
              item-title="displayName"
              variant="outlined"
              auto-select-first
              required
              @update:model-value="updateSupport($event as unknown as number | null)"
            />
          </v-col>
          <v-col
            cols="12"
            md="6"
          >
            <v-autocomplete
              :model-value="datasetStewardship.supportId"
              :items="users"
              :disabled="datasetStewardship.supportId === undefined"
              :rules="[required]"
              label="Support Email *"
              item-value="id"
              item-title="email"
              variant="outlined"
              auto-select-first
              required
              @update:model-value="updateSupport($event as unknown as number | null)"
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col
            cols="12"
            md="6"
          >
            <v-autocomplete
              :model-value="datasetStewardship.supportId"
              :items="users"
              :disabled="datasetStewardship.supportId === undefined"
              :rules="[required]"
              label="Support Position *"
              item-value="id"
              item-title="position"
              variant="outlined"
              auto-select-first
              required
              @update:model-value="updateSupport($event as unknown as number | null)"
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col
            cols="12"
            md="6"
          >
            <v-autocomplete
              :model-value="datasetStewardship.departmentId"
              :items="departments"
              :disabled="datasetStewardship.ownerId === undefined || departments.length === 0"
              :loading="isLoadingDepartments"
              :rules="[required]"
              item-value="id"
              item-title="name"
              label="Department *"
              variant="outlined"
              auto-select-first
              required
              @update:model-value="updateDepartment($event as unknown as number | null)"
            />
          </v-col>
          <v-col
            cols="12"
            md="6"
          >
            <v-autocomplete
              :model-value="datasetStewardship.divisionId"
              :items="divisions"
              :loading="isLoadingDivisions"
              :disabled="isNil(datasetStewardship.departmentId) || divisions.length === 0"
              item-value="id"
              item-title="name"
              label="Division"
              variant="outlined"
              auto-select-first
              clearable
              @update:model-value="updateDivision($event as unknown as number | null)"
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col
            cols="12"
            md="6"
          >
            <v-autocomplete
              :model-value="datasetStewardship.branchId"
              :items="branches"
              :loading="isLoadingBranches"
              :disabled="isNil(datasetStewardship.divisionId) || branches.length === 0"
              item-value="id"
              item-title="name"
              label="Branch"
              variant="outlined"
              auto-select-first
              clearable
              @update:model-value="updateBranch($event as unknown as number | null)"
            />
          </v-col>
          <v-col
            cols="12"
            md="6"
          >
            <v-autocomplete
              :model-value="datasetStewardship.unitId"
              :items="units"
              :loading="isLoadingUnits"
              :disabled="isNil(datasetStewardship.branchId) || units.length === 0"
              item-value="id"
              item-title="name"
              label="Unit"
              variant="outlined"
              auto-select-first
              clearable
              @update:model-value="updateUnit($event as unknown as number | null)"
            />
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
import { computed, ref, toRefs } from "vue"
import { isNil } from "lodash"

import { required } from "@/utils/validators"

import { UserGroupTypes } from "@/api/user-groups-api"
import datasetStewardshipsApi from "@/api/dataset-stewardships-api"

import useDataset from "@/use/use-dataset"
import useSnack from "@/use/use-snack"
import useUserGroups from "@/use/use-user-groups"
import useUsers from "@/use/use-users"

import SaveStateProgress from "@/components/SaveStateProgress.vue"

const props = defineProps({
  slug: {
    type: String,
    required: true,
  },
})

const snack = useSnack()
const { users } = useUsers()

const { slug } = toRefs(props)
const { dataset } = useDataset(slug)
const datasetStewardship = computed(() => dataset.value?.stewardship)

const isLoading = ref(false)
const departmentId = computed(() => datasetStewardship.value?.departmentId)
const divisionId = computed(() => datasetStewardship.value?.divisionId)
const branchId = computed(() => datasetStewardship.value?.branchId)
const departmentsQuery = computed(() => ({
  where: {
    type: UserGroupTypes.DEPARTMENT,
  },
}))
const divisionsQuery = computed(() => ({
  where: {
    type: UserGroupTypes.DIVISION,
    parentId: departmentId.value,
  },
}))
const branchesQuery = computed(() => ({
  where: {
    type: UserGroupTypes.BRANCH,
    parentId: divisionId.value,
  },
}))
const unitsQuery = computed(() => ({
  where: {
    type: UserGroupTypes.UNIT,
    parentId: branchId.value,
  },
}))
const { userGroups: departments, isLoading: isLoadingDepartments } = useUserGroups(
  departmentsQuery,
  { immediate: true }
)
const {
  userGroups: divisions,
  isLoading: isLoadingDivisions,
  fetch: fetchDivisions,
} = useUserGroups(divisionsQuery, { immediate: false })
const {
  userGroups: branches,
  isLoading: isLoadingBranches,
  fetch: fetchBranches,
} = useUserGroups(branchesQuery, { immediate: false })
const {
  userGroups: units,
  isLoading: isLoadingUnits,
  fetch: fetchUnits,
} = useUserGroups(unitsQuery, { immediate: false })

async function updateOwner(newOwnerId: number | null) {
  if (isNil(datasetStewardship.value)) {
    throw new Error("Dataset stewardship is not defined")
  }

  if (isNil(newOwnerId)) {
    throw new Error("Owner id is required")
  }

  const ownerId = newOwnerId
  const owner = users.value.find((user) => user.id === ownerId)
  if (owner === undefined) {
    throw new Error(`Could not find user with id ${ownerId}`)
  }

  datasetStewardship.value.ownerId = owner.id

  const {
    departmentId: newDepartmentId,
    divisionId: newDivisionId,
    branchId: newBranchId,
    unitId: newUnitId,
  } = owner.groupMembership || {}
  await updateDepartment(newDepartmentId)
  await updateDivision(newDivisionId)
  await updateBranch(newBranchId)
  await updateUnit(newUnitId)

  await saveAndNotify()
}

async function updateSupport(supportId: number | null) {
  if (isNil(datasetStewardship.value)) {
    throw new Error("Dataset stewardship is not defined")
  }

  if (isNil(supportId)) {
    throw new Error("Support id is required")
  }

  datasetStewardship.value.supportId = supportId

  await saveAndNotify()
}

function clearDivision() {
  if (isNil(datasetStewardship.value)) {
    throw new Error("Dataset stewardship is not defined")
  }

  datasetStewardship.value.divisionId = null
  clearBranch()
}

function clearBranch() {
  if (isNil(datasetStewardship.value)) {
    throw new Error("Dataset stewardship is not defined")
  }

  datasetStewardship.value.branchId = null
  clearUnit()
}

function clearUnit() {
  if (isNil(datasetStewardship.value)) {
    throw new Error("Dataset stewardship is not defined")
  }

  datasetStewardship.value.unitId = null
}

async function updateDepartment(newDepartmentId: number | null) {
  if (isNil(datasetStewardship.value)) {
    throw new Error("Dataset stewardship is not defined")
  }

  if (isNil(newDepartmentId)) {
    throw new Error("Department id is required")
  }

  datasetStewardship.value.departmentId = newDepartmentId
  clearDivision()

  await saveAndNotify()
}

async function updateDivision(newDivisionId: number | null) {
  if (isNil(datasetStewardship.value)) {
    throw new Error("Dataset stewardship is not defined")
  }

  if (isNil(newDivisionId)) {
    clearDivision()
    return
  }

  if (divisions.value.length === 0) {
    await fetchDivisions()
  }

  datasetStewardship.value.divisionId = newDivisionId
  clearBranch()

  await saveAndNotify()
}

async function updateBranch(newBranchId: number | null) {
  if (isNil(datasetStewardship.value)) {
    throw new Error("Dataset stewardship is not defined")
  }

  if (isNil(newBranchId)) {
    clearBranch()
    return
  }

  if (branches.value.length === 0) {
    await fetchBranches()
  }

  datasetStewardship.value.branchId = newBranchId
  clearUnit()

  await saveAndNotify()
}

async function updateUnit(newUnitId: number | null) {
  if (isNil(datasetStewardship.value)) {
    throw new Error("Dataset stewardship is not defined")
  }

  if (isNil(newUnitId)) {
    clearUnit()
    return
  }

  if (units.value.length === 0) {
    await fetchUnits()
  }

  datasetStewardship.value.unitId = newUnitId

  await saveAndNotify()
}

async function saveAndNotify() {
  if (isNil(datasetStewardship.value)) {
    throw new Error("Dataset stewardship is not defined")
  }

  isLoading.value = true
  try {
    await datasetStewardshipsApi.update(datasetStewardship.value.id, datasetStewardship.value)
    snack.notify("Updated owner information.", {
      color: "success",
    })
  } catch (error) {
    console.error(error)
    snack.notify("Failed to update owner information", {
      color: "error",
    })
  } finally {
    isLoading.value = false
  }
}
</script>
