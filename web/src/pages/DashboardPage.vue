<template>
  <v-container>
    <h2 class="d-flex justify-space-between">
      Dashboard
      <span>
        <v-btn
          class="mr-4"
          :to="{ name: 'StatusPage' }"
          dark
          color="primary"
          variant="outlined"
        >
          Status
        </v-btn>
        <v-btn
          dark
          color="primary"
          @click="logoutWrapper"
          >Log Out</v-btn
        >
      </span>
    </h2>

    <v-btn
      class="my-4"
      dark
      color="primary"
      variant="outlined"
      :to="{ name: 'DataSetNewPage' }"
      >Create Dataset</v-btn
    >

    <h3>Debugging: development</h3>
    <h4>Auth0 User</h4>
    <pre>
    {{ user }}
  </pre
    >

    <h4>Current User from Back-end</h4>
    <pre>
    {{ currentUser }}
  </pre
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
