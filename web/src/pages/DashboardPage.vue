<template>Dashboard</template>

<script lang="ts" setup>
import { useAuth0 } from "@auth0/auth0-vue"
import { onMounted } from "vue"

const { isLoading, isAuthenticated } = useAuth0()

onMounted(() => {
  console.log("isLoading.value:", isLoading.value)
  console.log("isAuthenticated.value:", isAuthenticated.value)
})
</script>
