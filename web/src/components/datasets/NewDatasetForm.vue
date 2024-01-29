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
          @update:model-value="updateOwner"
        >
          <template #no-data>
            <v-list-item>
              <v-btn block> TODO: Create New User </v-btn>
            </v-list-item>
          </template>
        </v-autocomplete>
      </v-col>
      <v-col
        v-if="stewardshipEvolution.ownerName"
        cols="12"
        md="6"
      >
        <v-text-field
          v-model="stewardshipEvolution.ownerPosition"
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
        v-if="stewardshipEvolution.supportName"
        cols="12"
        md="6"
      >
        <v-text-field
          v-model="stewardshipEvolution.supportEmail"
          :rules="[required]"
          label="Support Email *"
          variant="outlined"
          required
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col
        v-if="stewardshipEvolution.supportName"
        cols="12"
        md="6"
      >
        <v-text-field
          v-model="stewardshipEvolution.supportPosition"
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
          :rules="[required]"
          item-value="id"
          item-title="name"
          label="Department *"
          variant="outlined"
          auto-select-first
          clearable
          required
          @update:model-value="updateDepartment"
        />
      </v-col>
      <v-col
        v-if="stewardshipEvolution.department && departments.length > 0"
        cols="12"
        md="6"
      >
        <v-autocomplete
          :model-value="stewardshipEvolution.division"
          :items="divisions"
          item-value="id"
          item-title="name"
          label="Division"
          variant="outlined"
          auto-select-first
          clearable
          @update:model-value="updateDivision"
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col
        v-if="stewardshipEvolution.division && divisions.length > 0"
        cols="12"
        md="6"
      >
        <v-autocomplete
          :model-value="stewardshipEvolution.branch"
          :items="branches"
          item-value="id"
          item-title="name"
          label="Branch"
          variant="outlined"
          auto-select-first
          clearable
          @update:model-value="updateBranch"
        />
      </v-col>
      <v-col
        v-if="stewardshipEvolution.branch && branches.length > 0"
        cols="12"
        md="6"
      >
        <v-autocomplete
          :model-value="stewardshipEvolution.unit"
          :items="units"
          item-value="id"
          item-title="name"
          label="Unit"
          variant="outlined"
          auto-select-first
          clearable
          @update:model-value="updateUnit"
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
const { userGroups: departments } = useUserGroups(departmentsQuery)
const { userGroups: divisions } = useUserGroups(divisionsQuery)
const { userGroups: branches } = useUserGroups(branchesQuery)
const { userGroups: units } = useUserGroups(unitsQuery)

function updateOwner(ownerIdString: string): void {
  const ownerId = parseInt(ownerIdString)
  const owner = users.value.find((user) => user.id === ownerId)
  if (owner === undefined) {
    throw new Error(`Could not find user with id ${ownerId}`)
  }

  dataset.value.ownerId = owner.id
  stewardshipEvolution.value.ownerId = owner.id
  stewardshipEvolution.value.ownerName = owner.displayName
  stewardshipEvolution.value.ownerPosition = owner.position
  stewardshipEvolution.value.department = owner.department
  stewardshipEvolution.value.division = owner.division
  stewardshipEvolution.value.branch = owner.branch
  stewardshipEvolution.value.unit = owner.unit
  return
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

function updateDepartment(departmentIdString: string): void {
  departmentId.value = parseInt(departmentIdString)
  const department = departments.value.find((department) => department.id === departmentId.value)
  if (department === undefined) {
    throw new Error(`Could not find department with id ${departmentId}`)
  }

  stewardshipEvolution.value.department = department.name
  stewardshipEvolution.value.division = null
  stewardshipEvolution.value.branch = null
  stewardshipEvolution.value.unit = null
}

function updateDivision(divisionIdString: string): void {
  divisionId.value = parseInt(divisionIdString)
  const division = divisions.value.find((division) => division.id === divisionId.value)
  if (division === undefined) {
    throw new Error(`Could not find division with id ${divisionId}`)
  }

  stewardshipEvolution.value.division = division.name
  stewardshipEvolution.value.branch = null
  stewardshipEvolution.value.unit = null
}

function updateBranch(branchIdString: string): void {
  branchId.value = parseInt(branchIdString)
  const branch = branches.value.find((branch) => branch.id === branchId.value)
  if (branch === undefined) {
    throw new Error(`Could not find branch with id ${branchId}`)
  }

  stewardshipEvolution.value.branch = branch.name
  stewardshipEvolution.value.unit = null
}

function updateUnit(unitIdString: string): void {
  const unitId = parseInt(unitIdString)
  const unit = units.value.find((unit) => unit.id === unitId)
  if (unit === undefined) {
    throw new Error(`Could not find unit with id ${unitId}`)
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
