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
          v-model="dataSet.name"
          label="Name"
          variant="outlined"
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-textarea
          v-model="dataSet.description"
          label="Description"
          variant="outlined"
          rows="6"
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col
        cols="12"
        md="6"
      >
        <v-combobox
          v-model="stewardshipEvolution.ownerName"
          :items="users"
          label="Owner Name"
          item-value="name"
          item-title="name"
          variant="outlined"
          auto-select-first
          @input:model-value="updateOwner"
        />
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <!-- TODO: auto-fill from owner info selected in owner name -->
        <v-text-field
          v-model="stewardshipEvolution.ownerPosition"
          label="Owner Position"
          variant="outlined"
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col
        cols="12"
        md="6"
      >
        <v-combobox
          v-model="stewardshipEvolution.supportName"
          :items="users"
          label="Support Name"
          variant="outlined"
          item-value="name"
          item-title="name"
          auto-select-first
        />
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <!-- TODO: auto-fill from support info selected in support name -->
        <v-text-field
          v-model="stewardshipEvolution.supportEmail"
          label="Support Email"
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
        <!-- TODO: auto-fill from support info selected in support name -->
        <v-text-field
          v-model="stewardshipEvolution.supportPosition"
          label="Support Position"
          variant="outlined"
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
          label="Department"
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

type Dataset = {
  ownerId: User["id"]
  name: string
  description: string
}

type User = {
  id: number | null
  name: string | null
  email: string | null
  position: string | null
  department: string | null
  division: string | null
  branch: string | null
  unit: string | null
}

const dataSet = ref({
  name: "",
  description: "",
})

const stewardshipEvolution = ref<{
  ownerId: User["id"]
  supportId: User["id"]
  ownerName: User["name"]
  ownerPosition: User["position"]
  supportName: User["name"]
  supportEmail: User["email"]
  supportPosition: User["position"]
  department: User["department"]
  division: User["division"]
  branch: User["branch"]
  unit: User["unit"]
}>({
  ownerId: null,
  supportId: null,
  ownerName: null,
  ownerPosition: null,
  supportName: null,
  supportEmail: null,
  supportPosition: null,
  department: null,
  division: null,
  branch: null,
  unit: null,
})

const owner = ref<User | null>(null)

const users = ref([
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@yukon.ca",
    position: "Data Owner",
  },
  {
    id: 2,
    name: "Jane Doe",
    email: "jane.doe@yukon.ca",
    position: "Data Support",
  },
])

function updateOwner(value: string | User) {
  if (typeof value === "string") {
    stewardshipEvolution.value.ownerId = null
    stewardshipEvolution.value.ownerName = value
    // create user then load value here?
    return
  } else {
    owner.value = value
    stewardshipEvolution.value.ownerId = value.id
    stewardshipEvolution.value.ownerName = value.name
  }
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

function save() {
  alert("TODO: will persist the dataset")
}
</script>
