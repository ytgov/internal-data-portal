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
          @update:model-value="updateSupport"
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
          :disabled="stewardshipEvolution.ownerName === undefined"
          :loading="isLoadingDepartments"
          :rules="[required]"
          item-value="id"
          item-title="name"
          label="Department *"
          variant="outlined"
          auto-select-first
          clearable
          required
          @update:model-value="updateDepartmentId($event as unknown as number)"
        />
      </v-col>
      <v-col
        v-if="stewardshipEvolution.department"
        cols="12"
        md="6"
      >
        <v-autocomplete
          :model-value="stewardshipEvolution.division"
          :items="divisions"
          :loading="isLoadingDivisions"
          :disabled="divisions.length === 0"
          item-value="id"
          item-title="name"
          label="Division"
          variant="outlined"
          auto-select-first
          clearable
          @update:model-value="updateDivisionId($event as unknown as number)"
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col
        v-if="stewardshipEvolution.division"
        cols="12"
        md="6"
      >
        <v-autocomplete
          :model-value="stewardshipEvolution.branch"
          :items="branches"
          :loading="isLoadingBranches"
          :disabled="branches.length === 0"
          item-value="id"
          item-title="name"
          label="Branch"
          variant="outlined"
          auto-select-first
          clearable
          @update:model-value="updateBranchId($event as unknown as number)"
        />
      </v-col>
      <v-col
        v-if="stewardshipEvolution.branch"
        cols="12"
        md="6"
      >
        <v-autocomplete
          :model-value="stewardshipEvolution.unit"
          :items="units"
          :loading="isLoadingUnits"
          :disabled="units.length === 0"
          item-value="id"
          item-title="name"
          label="Unit"
          variant="outlined"
          auto-select-first
          clearable
          @update:model-value="updateUnitId($event as unknown as number)"
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
import { computed, ref, watch } from "vue"
import { useRouter } from "vue-router"

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
const { userGroups: departments, isLoading: isLoadingDepartments } = useUserGroups(departmentsQuery)
const {
  userGroups: divisions,
  isLoading: isLoadingDivisions,
  fetch: fetchDivisions,
} = useUserGroups(divisionsQuery, {
  eager: false,
})
const {
  userGroups: branches,
  isLoading: isLoadingBranches,
  fetch: fetchBranches,
} = useUserGroups(branchesQuery, { eager: false })
const {
  userGroups: units,
  isLoading: isLoadingUnits,
  fetch: fetchUnits,
} = useUserGroups(unitsQuery, { eager: false })

function updateOwner(newOwnerId: number | null): void {
  if (newOwnerId === null) {
    delete dataset.value.ownerId
    delete stewardshipEvolution.value.ownerId
    delete stewardshipEvolution.value.ownerName
    delete stewardshipEvolution.value.ownerPosition
    departmentId.value = null
    divisionId.value = null
    branchId.value = null
    unitId.value = null
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

  // TODO: switch to ids? and trigger updateXXX methdods
  const department = departments.value.find((department) => department.name === owner.department)
  if (department !== undefined) {
    updateDepartmentId(department.id)
  }

  const division = divisions.value.find((division) => division.name === owner.division)
  if (division !== undefined) {
    updateDivisionId(division.id)
  }

  const branch = branches.value.find((branch) => branch.name === owner.branch)
  if (branch !== undefined) {
    updateBranchId(branch.id)
  }

  const unit = units.value.find((unit) => unit.name === owner.unit)
  if (unit !== undefined) {
    updateUnitId(unit.id)
  }
}

function updateSupport(supportIdString: string): void {
  const supportId = parseInt(supportIdString)
  const support = users.value.find((user) => user.id === supportId)
  if (support === undefined) {
    throw new Error(`Could not find user with id ${supportId}`)
  }

  stewardshipEvolution.value.supportId = support.id
  stewardshipEvolution.value.supportName = support.displayName
  stewardshipEvolution.value.supportEmail = support.email
  stewardshipEvolution.value.supportPosition = support.position
}

function updateDepartmentId(newDepartmentId: number): void {
  departmentId.value = newDepartmentId
}

function updateDivisionId(newDivisionId: number): void {
  divisionId.value = newDivisionId
}

function updateBranchId(newBranchId: number): void {
  branchId.value = newBranchId
}

function updateUnitId(newUnitId: number): void {
  unitId.value = newUnitId
}

watch(
  () => [departmentId.value, departments.value],
  () => {
    if (departmentId.value === null) return

    const department = departments.value.find((department) => department.id === departmentId.value)
    if (department === undefined) {
      throw new Error(`Could not find department with id ${departmentId.value}`)
    }

    stewardshipEvolution.value.department = department.name
    stewardshipEvolution.value.division = null
    stewardshipEvolution.value.branch = null
    stewardshipEvolution.value.unit = null
    fetchDivisions()
  }
)

watch(
  () => [divisionId.value, divisions.value],
  () => {
    if (divisionId.value === null) return

    const division = divisions.value.find((division) => division.id === divisionId.value)
    if (division === undefined) {
      throw new Error(`Could not find division with id ${divisionId.value}`)
    }

    stewardshipEvolution.value.division = division.name
    stewardshipEvolution.value.branch = null
    stewardshipEvolution.value.unit = null
    fetchBranches()
  }
)

watch(
  () => [branchId.value, branches],
  () => {
    if (branchId.value === null) return

    const branch = branches.value.find((branch) => branch.id === branchId.value)
    if (branch === undefined) {
      throw new Error(`Could not find branch with id ${branchId.value}`)
    }

    stewardshipEvolution.value.branch = branch.name
    stewardshipEvolution.value.unit = null
    fetchUnits()
  }
)

watch(
  () => [unitId.value, units.value],
  () => {
    if (unitId.value === null) return

    const unit = units.value.find((unit) => unit.id === unitId.value)
    if (unit === undefined) {
      throw new Error(`Could not find unit with id ${unitId.value}`)
    }

    stewardshipEvolution.value.unit = unit.name
  }
)

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
