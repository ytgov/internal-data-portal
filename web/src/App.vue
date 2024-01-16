<template>
  <v-app>
    <!--
      NOTE: current user will always be defined when the router view loads.
      I'll have to test how this affect unauthenticated routes ...
    -->
    <router-view v-if="isReady" />
    <PageLoader v-else />
  </v-app>
</template>

<script lang="ts" setup>
import { computed, watch } from "vue"
import { useAuth0 } from "@auth0/auth0-vue"

import useCurrentUser from "@/use/use-current-user"
import PageLoader from "@/components/PageLoader.vue"

const { isLoading: isLoadingAuth0, isAuthenticated } = useAuth0()
const isReadyAuth0 = computed(() => !isLoadingAuth0.value && isAuthenticated.value)
const { isReady: isReadyCurrentUser, ensure } = useCurrentUser()

const isReady = computed(() => isReadyAuth0.value && isReadyCurrentUser.value)

watch(
  () => isReadyAuth0.value,
  async (newIsReadyAuth0) => {
    if (newIsReadyAuth0 === true) {
      try {
        await ensure()
        console.log("isReadyCurrentUser.value:", isReadyCurrentUser.value)
        console.log("isReady.value:", isReady.value)
      } catch (error) {
        console.log("Failed to ensure current user:", error)
        // Toast/snack Please contact support ...
        // logout?
      }
    }
  },
  { immediate: true }
)
</script>
