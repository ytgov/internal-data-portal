<template>
  <v-app>
    <PageLoader v-if="isLoading" />
    <router-view v-else />
  </v-app>
</template>

<script lang="ts" setup>
import { useAuth0 } from "@auth0/auth0-vue"

import PageLoader from "@/components/PageLoader.vue"

const { isLoading } = useAuth0()
</script>
