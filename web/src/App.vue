<template>
  <v-app>
    <PageLoader v-if="isLoading" />
    <router-view v-else />
  </v-app>
</template>

<script lang="ts" setup>
import { useAuth0 } from "@auth0/auth0-vue"
import { watch } from "vue"
import { useRouter } from "vue-router"

import PageLoader from "@/components/PageLoader.vue"

const router = useRouter()
const { isLoading, isAuthenticated } = useAuth0()

// TODO: this is hacked-together, it should reworked before final usage
watch(
  () => [isLoading.value, isAuthenticated.value],
  ([newIsLoading, newIsAuthenticated], _oldValues) => {
    if (newIsLoading === false && newIsAuthenticated === true) {
      router.push("/dashboard")
    } else if (newIsLoading === false && newIsAuthenticated) {
      router.push("/sign-in")
    }
  },
  {
    immediate: true,
  }
)
</script>
