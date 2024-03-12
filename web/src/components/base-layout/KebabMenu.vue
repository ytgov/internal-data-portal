<template>
  <v-menu offset-y>
    <template #activator="{ props }">
      <v-btn
        icon="mdi-dots-vertical"
        color="primary"
        v-bind="props"
      ></v-btn>
    </template>

    <v-list>
      <v-list-item
        title="All Datasets"
        :to="{ name: 'DatasetsPage' }"
        prepend-icon="mdi-database"
      />
      <v-list-item
        :title="status?.RELEASE_TAG || 'loading...'"
        :to="{ name: 'StatusPage' }"
        prepend-icon="mdi-clock"
      />
      <v-list-item
        title="Sign out"
        prepend-icon="mdi-exit-run"
        @click="logoutWrapper"
      />
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
