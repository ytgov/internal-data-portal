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
            <UserSearchableAutocomplete
              :model-value="datasetStewardship.ownerId"
              :filters="{ withPresenceOf: ['firstName', 'lastName'] }"
              :rules="[required]"
              label="Owner Name *"
              item-value="id"
              item-title="displayName"
              variant="outlined"
              auto-select-first
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
            <UserSearchableAutocomplete
              :model-value="datasetStewardship.supportId"
              :filters="{ withPresenceOf: ['firstName', 'lastName'] }"
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
            <UserSearchableAutocomplete
              :model-value="datasetStewardship.supportId"
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
            <UserSearchableAutocomplete
              :model-value="datasetStewardship.supportId"
              :disabled="datasetStewardship.supportId === undefined"
              :filters="{ withPresenceOf: ['position'] }"
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
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
import { computed, ref, toRefs } from "vue"
import { isNil } from "lodash"

import { required } from "@/utils/validators"

import datasetStewardshipsApi from "@/api/dataset-stewardships-api"

import usersApi from "@/api/users-api"
import useDataset from "@/use/use-dataset"
import useSnack from "@/use/use-snack"

import SaveStateProgress from "@/components/SaveStateProgress.vue"
import UserSearchableAutocomplete from "@/components/users/UserSearchableAutocomplete.vue"
import UserGroupAutocomplete, {
  UserGroupTypes,
} from "@/components/user-groups/UserGroupAutocomplete.vue"

const props = defineProps({
  slug: {
    type: String,
    required: true,
  },
})

const snack = useSnack()

const { slug } = toRefs(props)
const { dataset } = useDataset(slug)
const datasetStewardship = computed(() => dataset.value?.stewardship)

const isLoading = ref(false)

async function updateOwner(newOwnerId: number | null) {
  if (isNil(datasetStewardship.value)) {
    throw new Error("Dataset stewardship is not defined")
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

    await saveAndNotify()
  } catch (error) {
    console.error(error)
    snack.notify(`Failed to update owner information: ${error}`, {
      color: "error",
    })
  }
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
