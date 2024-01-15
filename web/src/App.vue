<template>
  <v-app>
    <router-view />
  </v-app>
</template>

<script lang="ts" setup>
// import { useAuth0 } from "@auth0/auth0-vue"
// import { watch } from "vue"
// import { useRouter } from "vue-router"

// const router = useRouter()
// const { isLoading, isAuthenticated } = useAuth0()

// TODO: this is hacked-together, it should reworked before final usage
// watch(
//   () => [isLoading.value, isAuthenticated.value],
//   ([newIsLoading, newIsAuthenticated], _) => {
//     if (newIsLoading === false && newIsAuthenticated === true) {
//       router.push("/dashboard")
//     } else if (!newIsLoading && !isAuthenticated.value) {
//       router.push("/sign-in")
//     }
//   },
//   {
//     immediate: true,
//   }
// )
</script>
