<template>
  <v-app>
    <PageLoader v-if="isLoadingAuth0 || isLoadingCurrentUser" />
    <router-view v-else />
  </v-app>
</template>

<script lang="ts" setup>
import { onMounted } from "vue"

import { useAuth0 } from "@auth0/auth0-vue"

import { useCurrentUser } from "@/use/use-current-user"
import PageLoader from "@/components/PageLoader.vue"

const { isLoading: isLoadingAuth0 } = useAuth0()

const { currentUser, isLoading: isLoadingCurrentUser, ensure } = useCurrentUser()

onMounted(async () => {
  // await isAuthenticated?
  // Though maybe the route guard will prevent this from being reached until after authentication?
  try {
    await ensure()
  } catch(error) {
    console.log("error:", error)
    // await create({})
  }
})
</script>
