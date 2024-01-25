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
          v-model="stewardshipEvolution.department"
          :items="departments"
          :rules="[required]"
          label="Department *"
          variant="outlined"
          auto-select-first
          clearable
          required
        />
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <v-autocomplete
          v-model="stewardshipEvolution.division"
          :items="divisions"
          label="Division"
          variant="outlined"
          auto-select-first
          clearable
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col
        cols="12"
        md="6"
      >
        <v-autocomplete
          v-model="stewardshipEvolution.branch"
          :items="branches"
          label="Branch"
          variant="outlined"
          auto-select-first
          clearable
        />
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <v-autocomplete
          v-model="stewardshipEvolution.unit"
          :items="units"
          label="Unit"
          variant="outlined"
          auto-select-first
          clearable
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
import { ref } from "vue"

import { type VForm } from "vuetify/lib/components/index.mjs"

import datasetsApi, { type Dataset } from "@/api/datasets-api"
import { type User } from "@/api/users-api"

import useSnack from "@/use/use-snack"
import useUsers from "@/use/use-users"

import { required } from "@/utils/validators"

const snack = useSnack()
const form = ref<InstanceType<typeof VForm> | null>(null)
const isValid = ref(null)
const dataset = ref<Partial<Dataset>>({})

const stewardshipEvolution = ref<
  Partial<{
    ownerId: User["id"]
    supportId: User["id"]
    ownerName: User["displayName"]
    ownerPosition: User["position"]
    supportName: User["displayName"]
    supportEmail: User["email"]
    supportPosition: User["position"]
    department: User["department"]
    division: User["division"]
    branch: User["branch"]
    unit: User["unit"]
  }>
>({})

const { users } = useUsers()

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

const departments = ref([
  "Department of Galactic Research",
  "Ministry of Time Travel Affairs",
  "Bureau of Quantum Computing",
  "Office of Intergalactic Relations",
  "Department of Historical Preservation",
  "Ministry of Virtual Reality",
  "Bureau of Advanced Robotics",
  "Office of Cybersecurity",
  "Department of Teleportation Studies",
  "Ministry of Alternate Realities",
  "Bureau of Space-Time Continuum",
])

const divisions = ref([
  "Galactic Exploration Division",
  "Temporal Research Division",
  "Quantum Algorithms Division",
  "Alien Diplomacy Division",
  "Ancient Artifacts Division",
  "Virtual Experiences Division",
  "Robotics Innovation Division",
  "Cyber Defense Division",
  "Teleportation Ethics Division",
  "Parallel Universes Division",
  "Space-Time Anomalies Division",
])

const branches = ref([
  "Stellar Mapping Branch",
  "Time Travel Protocols Branch",
  "Quantum Encryption Branch",
  "Extraterrestrial Communication Branch",
  "Archaeological Discoveries Branch",
  "Immersive Technologies Branch",
  "Automaton Developments Branch",
  "Network Security Branch",
  "Instant Transport Branch",
  "Multiverse Research Branch",
  "Dimensional Physics Branch",
])

const units = ref([
  "Nebula Analysis Unit",
  "Chronology Unit",
  "Quantum Computing Unit",
  "Intergalactic Negotiations Unit",
  "Historical Conservation Unit",
  "Virtual Development Unit",
  "Synthetic Intelligence Unit",
  "Cyber Surveillance Unit",
  "Teleportation Safety Unit",
  "Alternate Worlds Unit",
  "Wormhole Exploration Unit",
])

async function save() {
  if (form.value === null) throw new Error("Form is null")

  const { valid } = await form.value.validate()
  if (!valid) throw new Error("Form is invalid")

  try {
    const { dataset: newDataset } = await datasetsApi.create(dataset.value)
    dataset.value = newDataset
    snack.notify("Created new dataset!", {
      color: "success",
    })
  } catch (error) {
    console.error(error)
    snack.notify("Failed to create dataset", {
      color: "error",
    })
  }
}
</script>
