<template>
  <v-menu offset-y>
    <template #activator="{ props }">
      <v-btn
        icon="mdi-dots-vertical"
        color="primary"
        v-bind="props"
      ></v-btn>
    </template>

    <v-list density="compact">
      <v-list-item :to="{ name: 'StatusPage' }">
        <template #prepend>
          <v-icon>mdi-clock</v-icon>
        </template>
        <v-list-item-title class="text-body-2">
          {{ status?.RELEASE_TAG || "loading..." }}
        </v-list-item-title>
      </v-list-item>
      <v-list-item @click="logoutWrapper">
        <template #prepend>
          <v-icon>mdi-exit-run</v-icon>
        </template>
        <v-list-item-title class="text-body-2">Sign out</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script setup lang="ts">
import { onMounted } from "vue"

import { useAuth0 } from "@auth0/auth0-vue"

import useStatus from "@/use/use-status"

const { logout } = useAuth0()

const { status, fetch } = useStatus()

onMounted(async () => {
  await fetch()
})

async function logoutWrapper() {
  await logout({
    logoutParams: {
      // I would prefer to redirect to /sign-in here, but that doesn't seem to work?
      returnTo: window.location.origin,
    },
  })
}
</script>
