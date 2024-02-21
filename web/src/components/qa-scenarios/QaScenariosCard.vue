<template>
  <v-card class="mx-auto">
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
import { computed } from "vue"
import { isNil } from "lodash"

import http from "@/api/http-client"
import useSnack from "@/use/use-snack"
import useCurrentUser, { RoleTypes } from "@/use/use-current-user"

type Scenario = {
  url: string
  label: string
  isLoading?: boolean
}

const snack = useSnack()
const { currentUser, fetch: refreshCurrentUser } = useCurrentUser()

// Keep in sync with api/src/controllers/qa-scenarios/cycle-user-role-type.ts
const ORDERED_ROLE_TYPES = [
  RoleTypes.USER,
  RoleTypes.DATA_OWNER,
  RoleTypes.BUSINESS_ANALYST,
  RoleTypes.SYSTEM_ADMIN,
]

const currentRoleType = computed<RoleTypes | null>(() => {
  if (isNil(currentUser.value)) return null

  return currentUser.value.roleTypes[0] || null
})

const nextRoleType = computed<RoleTypes | null>(() => {
  if (isNil(currentRoleType.value)) return null

  const currentIndex = ORDERED_ROLE_TYPES.indexOf(currentRoleType.value)
  const nextIndex = (currentIndex + 1) % 4
  return ORDERED_ROLE_TYPES[nextIndex]
})

const scenarios = computed<Scenario[]>(() => [
  {
    url: "/api/qa-scenarios/link-random-tags",
    label: "Link Random Tags",
  },
  {
    url: "/api/qa-scenarios/apply-random-access-grants",
    label: "Apply Random Access Grants",
  },
  {
    url: "/api/qa-scenarios/add-random-access-requests",
    label: "Add Random Subscriptions (Access Requests)",
  },
  {
    url: "/api/qa-scenarios/cycle-user-role-type",
    label: `Cycle User Type From "${currentRoleType.value || "..."}" To "${
      nextRoleType.value || "..."
    }"`,
  },
])

async function triggerScenario(scenario: Scenario) {
  scenario.isLoading = true
  try {
    const { data } = await http.post(scenario.url)
    await refreshCurrentUser()
    snack.notify(data.message, { color: "success" })
  } catch (error: unknown) {
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
