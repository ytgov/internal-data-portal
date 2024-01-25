<template>
  <v-form
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
        <v-autocomplete
          :model-value="stewardshipEvolution.ownerName"
          :items="users"
          label="Owner Name *"
          item-value="id"
          item-title="displayName"
          variant="outlined"
          auto-select-first
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
        <!-- TODO: auto-fill from owner info selected in owner name -->
        <v-text-field
          v-model="stewardshipEvolution.ownerPosition"
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
          v-model="stewardshipEvolution.supportName"
          :items="users"
          label="Support Name *"
          variant="outlined"
          item-value="displayName"
          item-title="displayName"
          auto-select-first
          required
        />
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <!-- TODO: auto-fill from support info selected in support name -->
        <v-text-field
          v-model="stewardshipEvolution.supportEmail"
          label="Support Email *"
          variant="outlined"
          auto-select-first
          required
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col
        cols="12"
        md="6"
      >
        <!-- TODO: auto-fill from support info selected in support name -->
        <v-text-field
          v-model="stewardshipEvolution.supportPosition"
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
        <!-- TODO: auto-fill from owner info selected in owner name -->
        <v-autocomplete
          v-model="stewardshipEvolution.department"
          :items="departments"
          label="Department *"
          variant="outlined"
          auto-select-first
          required
        />
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <!-- TODO: auto-fill from support info selected in support name -->
        <v-autocomplete
          v-model="stewardshipEvolution.division"
          :items="divisions"
          label="Division"
          variant="outlined"
          auto-select-first
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col
        cols="12"
        md="6"
      >
        <!-- TODO: auto-fill from owner info selected in owner name -->
        <v-autocomplete
          v-model="stewardshipEvolution.branch"
          :items="branches"
          label="Branch"
          variant="outlined"
          auto-select-first
        />
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <!-- TODO: auto-fill from support info selected in support name -->
        <v-autocomplete
          v-model="stewardshipEvolution.unit"
          :items="units"
          label="Unit"
          variant="outlined"
          auto-select-first
        />
      </v-col>
    </v-row>
    <div class="d-flex justify-end mt-4">
      <v-btn
        type="submit"
        color="success"
        >Save</v-btn
      >
    </div>
  </v-form>
</template>

<script lang="ts" setup>
import { ref } from "vue"

import datasetsApi, { type Dataset } from "@/api/datasets-api"
import { type User } from "@/api/users-api"

import useSnack from "@/use/use-snack"
import useUsers from "@/use/use-users"

const snack = useSnack()
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
  console.log("dataset.value:", JSON.stringify(dataset.value, null, 2))
  stewardshipEvolution.value.ownerId = owner.id
  stewardshipEvolution.value.ownerName = owner.displayName
  return
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
  try {
    const { dataset: newDataset } = await datasetsApi.create(dataset.value)
    dataset.value = newDataset
  } catch (error) {
    console.error(error)
    snack.notify("Failed to create dataset", {
      color: "error",
    })
  }
}
</script>
