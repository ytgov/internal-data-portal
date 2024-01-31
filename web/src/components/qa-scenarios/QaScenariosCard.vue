<template>
  <v-card
    class="mx-auto"
    max-width="300"
  >
    <v-card-title>QA Scenarios</v-card-title>
    <v-divider
      :thickness="1"
      class="border-opacity-100"
    />
    <v-row
      v-for="(scenario, index) in scenarios"
      :key="index"
      :value="scenario"
      class="pa-4"
      no-gutters
    >
      <v-col>
        <v-btn
          block
          variant="outlined"
          :loading="scenario.isLoading"
          @click="triggerScenario(scenario)"
        >
          {{ scenario.label }}
        </v-btn>
      </v-col>
    </v-row>
  </v-card>
</template>

<script lang="ts" setup>
import { ref } from "vue"

import http from "@/api/http-client"
import useSnack from "@/use/use-snack"

type Scenario = {
  url: string
  label: string
  isLoading: boolean | undefined
}

const snack = useSnack()

const scenarios = ref<Scenario[]>([
  {
    url: "/api/qa-scenarios/link-random-tags",
    label: "Link Random Tags",
  },
  {
    url: "/api/qa-scenarios/apply-random-access-grants",
    label: "Apply Random Access Grants",
  },
])

async function triggerScenario(scenario: Scenario) {
  scenario.isLoading = true
  try {
    const { data } = await http.post(scenario.url)
    snack.notify(data.message, { color: "success" })
  } catch (error: any) {
    if (error instanceof Error) {
      console.error(error)
      snack.notify(error.message, { color: "error" })
    } else {
      console.error(error)
      snack.notify(`An error occurred: ${error}`, { color: "error" })
    }
  } finally {
    scenario.isLoading = false
  }
}
</script>
