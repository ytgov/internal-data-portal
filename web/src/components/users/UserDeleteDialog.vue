<template>TODO: Implement UserDeleteDialog.vue</template>

<script setup lang="ts">
import { User } from "@/use/use-user"

defineExpose({
  show: (user: User) => {
    console.log(`user:`, user)
  },
})
</script>
