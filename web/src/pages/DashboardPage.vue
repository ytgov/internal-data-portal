<template>Dashboard</template>

<script lang="ts" setup>
import { useAuth0 } from "@auth0/auth0-vue"
import { onMounted } from "vue"
import { useRouter } from "vue-router"

const router = useRouter()
const { isLoading, isAuthenticated } = useAuth0()

// TODO: move to route guard!
onMounted(() => {
  if (isLoading.value === false && isAuthenticated.value === true) {
    router.push("/dashboard")
  } else if (isLoading.value === false && isAuthenticated.value) {
    router.push("/sign-in")
  } else {
    console.error("Unexpected state")
  }
})
</script>
