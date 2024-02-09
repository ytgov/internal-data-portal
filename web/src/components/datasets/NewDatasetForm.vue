<template>
  <v-form
    ref="form"
    v-model="isValid"
    class="d-flex flex-column"
    @submit.prevent="save"
  >
    <v-row>
      <v-col
        cols="12"
        md="6"
      >
        <v-text-field
          v-model="dataset.name"
          :rules="[required]"
          label="Name *"
          variant="outlined"
          required
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-textarea
          v-model="dataset.description"
          :rules="[required]"
          label="Description *"
          variant="outlined"
          rows="6"
          required
        />
      </v-col>
    </v-row>
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
          clearable
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
          clearable
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
          clearable
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
    <div class="d-flex justify-end mt-4">
      <v-btn
        v-if="isValid"
        type="submit"
        color="primary"
      >
        Create
      </v-btn>
      <v-tooltip v-else>
        <template #activator="{ props }">
          <span v-bind="props">
            <v-btn
              disabled
              type="submit"
              color="success"
            >
              Save
              <v-icon end>mdi-help-circle-outline</v-icon>
            </v-btn>
          </span>
        </template>
        <span class="text-white">Some required fields have not been filled in</span>
      </v-tooltip>
    </div>
  </v-form>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue"
import { useRouter } from "vue-router"
import { isNil } from "lodash"

import { type VForm } from "vuetify/lib/components/index.mjs"

import datasetsApi, { type Dataset } from "@/api/datasets-api"
import { UserGroupTypes } from "@/api/user-groups-api"
import { DatasetStewardship } from "@/api/dataset-stewardships-api"

import useSnack from "@/use/use-snack"
import useUserGroups from "@/use/use-user-groups"
import useUsers from "@/use/use-users"

import { required } from "@/utils/validators"

const router = useRouter()
const snack = useSnack()
const form = ref<InstanceType<typeof VForm> | null>(null)
const isValid = ref(null)
const dataset = ref<Partial<Dataset>>({})

const datasetStewardship = ref<Partial<DatasetStewardship>>({})

const { users } = useUsers()

const departmentId = computed(() => datasetStewardship.value.departmentId)
const divisionId = computed(() => datasetStewardship.value.divisionId)
const branchId = computed(() => datasetStewardship.value.branchId)
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
  if (isNil(newOwnerId)) {
    delete dataset.value.ownerId
    delete datasetStewardship.value.ownerId
    clearDepartment()
    return
  }

  const ownerId = newOwnerId
  const owner = users.value.find((user) => user.id === ownerId)
  if (owner === undefined) {
    throw new Error(`Could not find user with id ${ownerId}`)
  }

  dataset.value.ownerId = owner.id
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
}

function updateSupport(supportId: number | null) {
  if (isNil(supportId)) {
    delete datasetStewardship.value.supportId
    return
  }

  datasetStewardship.value.supportId = supportId
}

function clearDepartment() {
  delete datasetStewardship.value.departmentId
  clearDivision()
}

function clearDivision() {
  delete datasetStewardship.value.divisionId
  clearBranch()
}

function clearBranch() {
  delete datasetStewardship.value.branchId
  clearUnit()
}

function clearUnit() {
  delete datasetStewardship.value.unitId
}

async function updateDepartment(newDepartmentId: number | null) {
  if (isNil(newDepartmentId)) {
    clearDepartment()
    return
  }

  datasetStewardship.value.departmentId = newDepartmentId
  clearDivision()
}

async function updateDivision(newDivisionId: number | null) {
  if (isNil(newDivisionId)) {
    clearDivision()
    return
  }

  if (divisions.value.length === 0) {
    await fetchDivisions()
  }

  datasetStewardship.value.divisionId = newDivisionId
  clearBranch()
}

async function updateBranch(newBranchId: number | null) {
  if (isNil(newBranchId)) {
    clearBranch()
    return
  }

  if (branches.value.length === 0) {
    await fetchBranches()
  }

  datasetStewardship.value.branchId = newBranchId
  clearUnit()
}

async function updateUnit(newUnitId: number | null) {
  if (isNil(newUnitId)) {
    clearUnit()
    return
  }

  if (units.value.length === 0) {
    await fetchUnits()
  }

  datasetStewardship.value.unitId = newUnitId
}

async function save() {
  if (form.value === null) throw new Error("Form is null")

  const { valid } = await form.value.validate()
  if (!valid) throw new Error("Form is invalid")

  try {
    const { dataset: newDataset } = await datasetsApi.create({
      ...dataset.value,
      stewardshipAttributes: datasetStewardship.value,
    })
    snack.notify("Created new dataset!", {
      color: "success",
    })
    router.push({
      name: "DatasetDescriptionManagePage",
      params: {
        slug: newDataset.slug,
      },
    })
  } catch (error) {
    console.error(error)
    snack.notify("Failed to create dataset", {
      color: "error",
    })
  }
}
</script>
