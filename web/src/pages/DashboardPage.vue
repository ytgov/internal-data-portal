<template>
  <v-container>
    <h2>Dashboard</h2>

    <h3>Auth0 User</h3>
    <pre>
    {{ user }}
  </pre
    >

    <h3>Current User from Back-end</h3>
    <pre>
    {{ currentUser }}
  </pre
    >

    <v-btn
      dark
      color="primary"
      @click="logoutWrapper"
      >Log Out</v-btn
    >
  </v-container>
</template>

<script lang="ts" setup>
import { useAuth0 } from "@auth0/auth0-vue"

import useCurrentUser from "@/use/use-current-user"

const { user, logout } = useAuth0()
const { currentUser } = useCurrentUser()

async function logoutWrapper() {
  await logout({
    logoutParams: {
      // I would prefer to redirect to /sign-in here, but that doesn't seem to work?
      returnTo: window.location.origin,
    },
  })
}
</script>
