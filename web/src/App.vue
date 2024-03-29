<template>
  <v-app>
    <router-view v-if="isUnauthenticatedRoute"></router-view>
    <!--
      NOTE: current user will always be defined when the authenticated router view loads.
    -->
    <router-view v-else-if="isReady || isErrored" />
    <PageLoader
      v-else-if="isReadyAuth0"
      message="Fetching and syncing user"
    />
    <PageLoader
      v-else
      message="Checking authentication status ..."
    />
    <AppSnackbar />
  </v-app>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from "vue"
import { useAuth0 } from "@auth0/auth0-vue"
import { useRoute, useRouter } from "vue-router"

import useCurrentUser from "@/use/use-current-user"

import PageLoader from "@/components/PageLoader.vue"
import AppSnackbar from "@/components/AppSnackbar.vue"

// TODO: consider moving this to a route guard?
const route = useRoute()
const isUnauthenticatedRoute = computed(() => route.meta.requiresAuth === false)

const { isLoading: isLoadingAuth0, isAuthenticated } = useAuth0()
const isReadyAuth0 = computed(() => !isLoadingAuth0.value && isAuthenticated.value)
const { isReady: isReadyCurrentUser, fetch } = useCurrentUser()

const isReady = computed(() => isReadyAuth0.value && isReadyCurrentUser.value)

const isErrored = ref(false)
const router = useRouter()
watch(
  () => isReadyAuth0.value,
  async (newIsReadyAuth0) => {
    // Don't bother attempting to load current user for unathenticated routes
    if (isUnauthenticatedRoute.value) return

    if (newIsReadyAuth0 === true) {
      try {
        await fetch()
      } catch (error) {
        console.log("Failed to load current user:", error)
        isErrored.value = true
        router.push({ name: "UnauthorizedPage" })
      }
    }
  },
  { immediate: true }
)
</script>
