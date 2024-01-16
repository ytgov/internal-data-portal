<template>
  <v-app>
    <router-view v-if="isUnauthenticatedRoute"></router-view>
    <!--
      NOTE: current user will always be defined when the authenticated router view loads.
    -->
    <router-view v-else-if="isReady" />
    <PageLoader v-else />
  </v-app>
</template>

<script lang="ts" setup>
import { computed, watch } from "vue"
import { useAuth0 } from "@auth0/auth0-vue"
import { useRoute } from "vue-router"

import useCurrentUser from "@/use/use-current-user"
import PageLoader from "@/components/PageLoader.vue"

const route = useRoute()
const isUnauthenticatedRoute = computed(() => route.meta.requiresAuth === false)

const { isLoading: isLoadingAuth0, isAuthenticated } = useAuth0()
const isReadyAuth0 = computed(() => !isLoadingAuth0.value && isAuthenticated.value)
const { isReady: isReadyCurrentUser, ensure } = useCurrentUser()

const isReady = computed(() => isReadyAuth0.value && isReadyCurrentUser.value)

watch(
  () => isReadyAuth0.value,
  async (newIsReadyAuth0) => {
    // Don't bother attempting to load current user for unathenticated routes
    if (isUnauthenticatedRoute.value) return

    if (newIsReadyAuth0 === true) {
      try {
        await ensure()
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
