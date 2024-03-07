<template>
  <v-container class="text-center mt-16">
    <h1>Unauthorized (401)</h1>
    <p>Authentication failed. If you think this is an error, please contact support.</p>
    <p>Alternatively, try logging out and signing in again.</p>
    <v-btn
      class="mt-6"
      color="primary"
      @click="logoutWithRedirect"
      >Logout</v-btn
    >
    <hr />
    <p>Site: {{ APPLICATION_NAME }}</p>
    <p>Version: {{ releaseTag }}</p>
    <p>Commit Hash: {{ gitCommitHash }}</p>
  </v-container>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue"
import { useAuth0 } from "@auth0/auth0-vue"

import http from "@/api/http-client"

import { APPLICATION_NAME } from "@/config"

const { logout } = useAuth0()

const releaseTag = ref("not-set")
const gitCommitHash = ref("not-set")

const isLoading = ref(true)

onMounted(async () => {
  await refresh()
})

function logoutWithRedirect() {
  return logout({
    logoutParams: {
      // I would prefer to redirect to /sign-in here, but that doesn't seem to work?
      returnTo: window.location.origin,
    },
  })
}

async function fetchVersion() {
  return http
    .get("/_status")
    .then(({ data }) => {
      releaseTag.value = data.RELEASE_TAG
      gitCommitHash.value = data.GIT_COMMIT_HASH
      return data
    })
    .catch((error: unknown) => {
      console.error(`Error fetching version: ${error}`)
    })
}

async function refresh() {
  isLoading.value = true
  try {
    await fetchVersion()
  } catch (error) {
    console.error(`Error fetching version: ${error}`)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
body {
  text-align: center;
  padding-top: 100px;
}
hr {
  margin-top: 30px;
  margin-bottom: 30px;
}
</style>
