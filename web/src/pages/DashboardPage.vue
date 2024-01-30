<template>
  <v-container>
    <h2 class="d-flex justify-space-between">
      Dashboard
      <span>
        <v-btn
          class="mr-4"
          color="primary"
          variant="outlined"
          :loading="isLoadingUserGroups"
          @click="syncUserGroups"
          >Sync User Groups</v-btn
        >
        <v-btn
          class="mr-4"
          :to="{ name: 'StatusPage' }"
          color="primary"
          variant="outlined"
        >
          Status
        </v-btn>
        <v-btn
          color="primary"
          @click="logoutWrapper"
          >Log Out</v-btn
        >
      </span>
    </h2>

    <v-btn
      class="my-4 mr-4"
      color="primary"
      variant="outlined"
      :to="{ name: 'DatasetsPage' }"
    >
      View Datasets
    </v-btn>
    <v-btn
      class="my-4"
      color="primary"
      :to="{ name: 'DatasetNewPage' }"
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
import { ref } from "vue"

import { useAuth0 } from "@auth0/auth0-vue"

import useCurrentUser from "@/use/use-current-user"
import userGroupsApi from "@/api/user-groups-api"

const { user, logout } = useAuth0()
const { currentUser } = useCurrentUser()
const isLoadingUserGroups = ref(false)

async function logoutWrapper() {
  await logout({
    logoutParams: {
      // I would prefer to redirect to /sign-in here, but that doesn't seem to work?
      returnTo: window.location.origin,
    },
  })
}

async function syncUserGroups() {
  isLoadingUserGroups.value = true
  try {
    await userGroupsApi.sync()
  } finally {
    isLoadingUserGroups.value = false
  }
}
</script>
