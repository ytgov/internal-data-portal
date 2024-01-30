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
          :model-value="stewardshipEvolution.ownerName"
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
        <v-text-field
          v-model="stewardshipEvolution.ownerPosition"
          :disabled="stewardshipEvolution.ownerName === undefined"
          :rules="[required]"
          label="Owner Position *"
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
        <v-autocomplete
          :model-value="stewardshipEvolution.supportName"
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
        <v-text-field
          v-model="stewardshipEvolution.supportEmail"
          :disabled="stewardshipEvolution.supportName === undefined"
          :rules="[required]"
          label="Support Email *"
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
          v-model="stewardshipEvolution.supportPosition"
          :disabled="stewardshipEvolution.supportName === undefined"
          :rules="[required]"
          label="Support Position *"
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
        <v-autocomplete
          :model-value="stewardshipEvolution.department"
          :items="departments"
          :disabled="stewardshipEvolution.ownerName === undefined || departments.length === 0"
          :loading="isLoadingDepartments"
          :rules="[required]"
          item-value="id"
          item-title="name"
          label="Department *"
          variant="outlined"
          auto-select-first
          clearable
          required
          @update:model-value="updateDepartment($event as unknown as number)"
          @clear="clearDepartment"
        />
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <v-autocomplete
          :model-value="stewardshipEvolution.division"
          :items="divisions"
          :loading="isLoadingDivisions"
          :disabled="isNil(stewardshipEvolution.department) || divisions.length === 0"
          item-value="id"
          item-title="name"
          label="Division"
          variant="outlined"
          auto-select-first
          clearable
          @update:model-value="updateDivision($event as unknown as number)"
          @clear="clearDivision"
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col
        cols="12"
        md="6"
      >
        <v-autocomplete
          :model-value="stewardshipEvolution.branch"
          :items="branches"
          :loading="isLoadingBranches"
          :disabled="isNil(stewardshipEvolution.division) || branches.length === 0"
          item-value="id"
          item-title="name"
          label="Branch"
          variant="outlined"
          auto-select-first
          clearable
          @update:model-value="updateBranch($event as unknown as number)"
          @clear="clearBranch"
        />
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <v-autocomplete
          :model-value="stewardshipEvolution.unit"
          :items="units"
          :loading="isLoadingUnits"
          :disabled="isNil(stewardshipEvolution.branch) || units.length === 0"
          item-value="id"
          item-title="name"
          label="Unit"
          variant="outlined"
          auto-select-first
          clearable
          @update:model-value="updateUnit($event as unknown as number)"
          @clear="clearUnit"
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

import datasetsApi, { type Dataset, type StewardshipEvolution } from "@/api/datasets-api"
import { UserGroupTypes } from "@/api/user-groups-api"

import useSnack from "@/use/use-snack"
import useUsers from "@/use/use-users"
import useUserGroups from "@/use/use-user-groups"

import { required } from "@/utils/validators"

const router = useRouter()
const snack = useSnack()
const form = ref<InstanceType<typeof VForm> | null>(null)
const isValid = ref(null)
const dataset = ref<Partial<Dataset>>({})

const stewardshipEvolution = ref<Partial<StewardshipEvolution>>({})

const { users } = useUsers()

const departmentId = ref<number | null>(null)
const divisionId = ref<number | null>(null)
const branchId = ref<number | null>(null)
const unitId = ref<number | null>(null)
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
const {
  userGroups: departments,
  isLoading: isLoadingDepartments,
  fetch: fetchDepartments,
} = useUserGroups(departmentsQuery, { immediate: false })
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
  if (newOwnerId === null) {
    delete dataset.value.ownerId
    delete stewardshipEvolution.value.ownerId
    delete stewardshipEvolution.value.ownerName
    delete stewardshipEvolution.value.ownerPosition
    clearDepartment()
    return
  }

  const ownerId = newOwnerId
  const owner = users.value.find((user) => user.id === ownerId)
  if (owner === undefined) {
    throw new Error(`Could not find user with id ${ownerId}`)
  }

  dataset.value.ownerId = owner.id
  stewardshipEvolution.value.ownerId = owner.id
  stewardshipEvolution.value.ownerName = owner.displayName
  stewardshipEvolution.value.ownerPosition = owner.position

  const {
    departmentId: newDepartmentId,
    divisionId: newDivisionId,
    branchId: newBranchId,
    unitId: newUnitId,
  } = owner.groupMembership || {}
  await updateDepartment(newDepartmentId)
  if (newDivisionId !== null) {
    await updateDivision(newDivisionId)

    if (newBranchId !== null) {
      await updateBranch(newBranchId)

      if (newUnitId !== null) {
        await updateUnit(newUnitId)
      }
    }
  }
}

function updateSupport(supportId: number | null) {
  if (supportId === null) {
    delete stewardshipEvolution.value.supportId
    delete stewardshipEvolution.value.supportName
    delete stewardshipEvolution.value.supportEmail
    delete stewardshipEvolution.value.supportPosition
    return
  }

  const support = users.value.find((user) => user.id === supportId)
  if (support === undefined) {
    throw new Error(`Could not find user with id ${supportId}`)
  }

  stewardshipEvolution.value.supportId = support.id
  stewardshipEvolution.value.supportName = support.displayName
  stewardshipEvolution.value.supportEmail = support.email
  stewardshipEvolution.value.supportPosition = support.position
}

// NOTE: clear function doesn't work as expected, might be a bug in Vuetify
function clearDepartment() {
  departmentId.value = null
  stewardshipEvolution.value.department = null
  clearDivision()
}

// NOTE: clear function doesn't work as expected, might be a bug in Vuetify
function clearDivision() {
  divisionId.value = null
  stewardshipEvolution.value.division = null
  clearBranch()
}

// NOTE: clear function doesn't work as expected, might be a bug in Vuetify
function clearBranch() {
  branchId.value = null
  stewardshipEvolution.value.branch = null
  clearUnit()
}

// NOTE: clear function doesn't work as expected, might be a bug in Vuetify
function clearUnit() {
  unitId.value = null
  stewardshipEvolution.value.unit = null
}

async function updateDepartment(newDepartmentId: number | null) {
  departmentId.value = newDepartmentId
  if (departmentId.value === null) return
  if (departments.value.length === 0) {
    await fetchDepartments()
  }

  const department = departments.value.find((department) => department.id === departmentId.value)
  if (department === undefined) {
    throw new Error(`Could not find department with id ${departmentId.value}`)
  }

  stewardshipEvolution.value.department = department.name
  clearDivision()
}

async function updateDivision(newDivisionId: number) {
  divisionId.value = newDivisionId

  if (divisionId.value === null) return
  if (divisions.value.length === 0) {
    await fetchDivisions()
  }

  const division = divisions.value.find((division) => division.id === divisionId.value)
  if (division === undefined) {
    throw new Error(`Could not find division with id ${divisionId.value}`)
  }

  stewardshipEvolution.value.division = division.name
  clearBranch()
}

async function updateBranch(newBranchId: number) {
  branchId.value = newBranchId

  if (branchId.value === null) return
  if (branches.value.length === 0) {
    await fetchBranches()
  }

  const branch = branches.value.find((branch) => branch.id === branchId.value)
  if (branch === undefined) {
    throw new Error(`Could not find branch with id ${branchId.value}`)
  }

  stewardshipEvolution.value.branch = branch.name
  clearUnit()
}

async function updateUnit(newUnitId: number) {
  unitId.value = newUnitId

  if (unitId.value === null) return
  if (units.value.length === 0) {
    await fetchUnits()
  }

  const unit = units.value.find((unit) => unit.id === unitId.value)
  if (unit === undefined) {
    throw new Error(`Could not find unit with id ${unitId.value}`)
  }

  stewardshipEvolution.value.unit = unit.name
}

async function save() {
  if (form.value === null) throw new Error("Form is null")

  const { valid } = await form.value.validate()
  if (!valid) throw new Error("Form is invalid")

  try {
    const { dataset: newDataset } = await datasetsApi.create({
      ...dataset.value,
      stewardshipEvolutionsAttributes: [stewardshipEvolution.value],
    })
    snack.notify("Created new dataset!", {
      color: "success",
    })
    router.push({
      name: "DatasetShowPage",
      params: {
        // @ts-expect-error - TODO: figure out why newDataset isn't detecting as having an id
        datasetId: newDataset.id,
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
