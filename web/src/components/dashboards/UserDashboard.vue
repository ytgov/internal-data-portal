<template>
  <h2>Dashboard</h2>
  <v-row class="mt-6">
    <v-col
      cols="12"
      md="6"
    >
      <DatasetSearchCard />
    </v-col>
    <v-col
      cols="12"
      md="6"
    >
      <MySubscriptionsCard />
    </v-col>
  </v-row>
</template>

<script lang="ts" setup>
import DatasetSearchCard from "@/components/dashboard-widgets/DatasetSearchCard.vue"
import MySubscriptionsCard from "@/components/dashboard-widgets/MySubscriptionsCard.vue"
</script>
