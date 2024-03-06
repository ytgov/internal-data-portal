<template>
  <h2 class="d-flex flex-column flex-md-row justify-space-between">
    Dashboard
    <v-btn
      class="mt-4 mt-md-0"
      color="primary"
      :to="{ name: 'DatasetsPage' }"
    >
      View Datasets
    </v-btn>
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
    </v-col>
  </v-row>
  <v-divider
    thickness="1"
    class="my-8 border-opacity-100"
  />
  <v-row>
    <v-col
      cols="12"
      md="6"
    >
      <QaScenariosCard />
    </v-col>
    <v-col
      cols="12"
      md="6"
    >
      <v-btn
        class="mr-4"
        color="primary"
        variant="outlined"
        :loading="isLoadingUserGroups"
        @click="syncUserGroups"
        >Sync User Groups</v-btn
      >
    </v-col>
  </v-row>
</template>

<script lang="ts" setup>
import { ref } from "vue"

import userGroupsApi from "@/api/user-groups-api"

import DatasetSearchCard from "@/components/datasets/DatasetSearchCard.vue"
import QaScenariosCard from "@/components/qa-scenarios/QaScenariosCard.vue"

const isLoadingUserGroups = ref(false)

async function syncUserGroups() {
  isLoadingUserGroups.value = true
  try {
    await userGroupsApi.sync()
  } finally {
    isLoadingUserGroups.value = false
  }
}
</script>
