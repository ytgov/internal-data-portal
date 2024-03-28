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
        <UserSearchableAutocomplete
          :model-value="datasetStewardship.ownerId"
          :filters="{ withPresenceOf: ['firstName', 'lastName'] }"
          :rules="[required]"
          label="Owner Name *"
          item-value="id"
          item-title="displayName"
          variant="outlined"
          auto-select-first
          clearable
          required
          @update:model-value="updateOwner($event as unknown as number | null)"
        />
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <UserSearchableAutocomplete
          :model-value="datasetStewardship.ownerId"
          :disabled="datasetStewardship.ownerId === undefined"
          :filters="{ withPresenceOf: ['position'] }"
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
        <UserSearchableAutocomplete
          :model-value="datasetStewardship.supportId"
          :filters="{ withPresenceOf: ['firstName', 'lastName'] }"
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
        <UserSearchableAutocomplete
          :model-value="datasetStewardship.supportId"
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
        <UserSearchableAutocomplete
          :model-value="datasetStewardship.supportId"
          :disabled="datasetStewardship.supportId === undefined"
          :filters="{ withPresenceOf: ['position'] }"
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
        <UserGroupAutocomplete
          label="Department *"
          :model-value="datasetStewardship.departmentId"
          :type="UserGroupTypes.DEPARTMENT"
          :parent-id="null"
          :disabled="datasetStewardship.ownerId === undefined"
          :rules="[required]"
          variant="outlined"
          clearable
          required
          @update:model-value="updateDepartment($event as unknown as number | null)"
        />
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <UserGroupAutocomplete
          label="Division"
          :model-value="datasetStewardship.divisionId"
          :type="UserGroupTypes.DIVISION"
          :parent-id="datasetStewardship.departmentId"
          :disabled="isNil(datasetStewardship.departmentId)"
          variant="outlined"
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
        <UserGroupAutocomplete
          label="Branch"
          :model-value="datasetStewardship.branchId"
          :type="UserGroupTypes.BRANCH"
          :parent-id="datasetStewardship.divisionId"
          :disabled="isNil(datasetStewardship.divisionId)"
          variant="outlined"
          clearable
          @update:model-value="updateBranch($event as unknown as number | null)"
        />
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <UserGroupAutocomplete
          label="Unit"
          :model-value="datasetStewardship.unitId"
          :type="UserGroupTypes.UNIT"
          :parent-id="datasetStewardship.branchId"
          :disabled="isNil(datasetStewardship.branchId)"
          variant="outlined"
          clearable
          @update:model-value="updateUnit($event as unknown as number | null)"
        />
      </v-col>
    </v-row>
    <div class="d-flex justify-end mt-4">
      <v-btn
        v-if="isValid"
        :loading="isLoading"
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
              Create
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
import { ref } from "vue"
import { useRouter } from "vue-router"
import { isNil } from "lodash"

import { type VForm } from "vuetify/lib/components/index.mjs"

import { type DatasetStewardship } from "@/api/dataset-stewardships-api"
import datasetsApi, { type Dataset } from "@/api/datasets-api"
import usersApi from "@/api/users-api"

import useSnack from "@/use/use-snack"

import { required } from "@/utils/validators"

import UserSearchableAutocomplete from "@/components/users/UserSearchableAutocomplete.vue"
import UserGroupAutocomplete, {
  UserGroupTypes,
} from "@/components/user-groups/UserGroupAutocomplete.vue"

const router = useRouter()
const snack = useSnack()
const form = ref<InstanceType<typeof VForm> | null>(null)
const isValid = ref(null)
const isLoading = ref(false)
const dataset = ref<Partial<Dataset>>({})

const datasetStewardship = ref<Partial<DatasetStewardship>>({})

async function updateOwner(newOwnerId: number | null) {
  if (isNil(newOwnerId)) {
    delete dataset.value.ownerId
    delete datasetStewardship.value.ownerId
    clearDepartment()
    return
  }

  if (isNil(newOwnerId)) {
    throw new Error("Owner id is required")
  }

  try {
    const { user: owner } = await usersApi.get(newOwnerId)
    datasetStewardship.value.ownerId = newOwnerId

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
  } catch (error) {
    console.error(error)
    snack.notify(`Failed to update owner information: ${error}`, {
      color: "error",
    })
  }
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

  datasetStewardship.value.divisionId = newDivisionId
  clearBranch()
}

async function updateBranch(newBranchId: number | null) {
  if (isNil(newBranchId)) {
    clearBranch()
    return
  }

  datasetStewardship.value.branchId = newBranchId
  clearUnit()
}

async function updateUnit(newUnitId: number | null) {
  if (isNil(newUnitId)) {
    clearUnit()
    return
  }

  datasetStewardship.value.unitId = newUnitId
}

async function save() {
  if (form.value === null) throw new Error("Form is null")

  const { valid } = await form.value.validate()
  if (!valid) throw new Error("Form is invalid")

  isLoading.value = true
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
  } finally {
    isLoading.value = false
  }
}
</script>
