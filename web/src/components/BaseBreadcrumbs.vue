<template>
  <v-breadcrumbs
    :items="breadcrumbs"
    class="mx-3"
    color="primary"
  >
    <template #divider>
      <v-icon icon="mdi-chevron-right"></v-icon>
    </template>
  </v-breadcrumbs>
</template>

<script lang="ts" setup>
import { useBreadcrumbs } from "@/use/use-breadcrumbs"

const { breadcrumbs } = useBreadcrumbs()
</script>
