<template>
  Dashboard

  <pre>
    {{ user }}
  </pre>

  <v-btn
    dark
    color="primary"
    @click="logoutWrapper"
    >Log Out</v-btn
  >
</template>

<script lang="ts" setup>
import { useAuth0 } from "@auth0/auth0-vue"
import { onMounted } from "vue"

const { isLoading, isAuthenticated, user, logout } = useAuth0()

onMounted(() => {
  console.log("isLoading.value:", isLoading.value)
  console.log("isAuthenticated.value:", isAuthenticated.value)
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
