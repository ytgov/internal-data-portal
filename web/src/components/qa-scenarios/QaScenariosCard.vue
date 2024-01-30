<template>
  <v-card
    class="mx-auto"
    max-width="300"
  >
    <v-card-title>QA Scenarios</v-card-title>
    <v-list density="compact">
      <v-list-item
        v-for="(scenario, index) in scenarios"
        :key="index"
        :value="scenario"
        color="primary"
      >
        <v-btn
          class="my-4 mr-4"
          @click="triggerScenario(scenario.url)"
        >
          {{ scenario.label }}
        </v-btn>
      </v-list-item>
    </v-list>
  </v-card>
</template>

<script lang="ts" setup>
import { ref } from "vue"

import http from "@/api/http-client"
import useSnack from "@/use/use-snack"

const snack = useSnack()

const scenarios = ref<
  {
    url: string
    label: string
  }[]
>([
  {
    url: "/api/qa-scenarios/link-random-tags",
    label: "Link Random Tags",
  },
])

async function triggerScenario(url: string) {
  try {
    const { data } = await http.post(url)
    snack.notify(data.message, { color: "success" })
  } catch (error: any) {
    if (error instanceof Error) {
      console.error(error)
      snack.notify(error.message, { color: "error" })
    } else {
      console.error(error)
      snack.notify(`An error occurred: ${error}`, { color: "error" })
    }
  }
}
</script>
