<template>
  <v-divider
    thickness="1"
    class="my-8 border-opacity-100"
  />
  <v-banner
    class="text-h6 font-weight-bold"
    icon="$warning"
    color="warning"
    text="The following features should be _completely_ removed before going to Production!"
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
