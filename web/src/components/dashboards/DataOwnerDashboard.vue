<template>
  <h2 class="d-flex flex-column flex-md-row justify-space-between">
    Dashboard
    <v-btn
      class="mt-4 mt-md-0"
      color="primary"
      :to="{ name: 'DatasetNewPage' }"
      >Create Dataset</v-btn
    >
  </h2>
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
      TODO: MySubscriptionsCard
      <v-skeleton-loader
        type="card"
        boilerplate
      />
      TODO: MyDataCard
      <v-skeleton-loader
        type="card"
        boilerplate
      />
    </v-col>
  </v-row>
  <v-row>
    <v-col>
      TODO: MyRequestsCard
      <v-skeleton-loader
        type="card"
        boilerplate
      />
    </v-col>
  </v-row>
</template>

<script lang="ts" setup>
import DatasetSearchCard from "@/components/dashboard-widgets/DatasetSearchCard.vue"
</script>
