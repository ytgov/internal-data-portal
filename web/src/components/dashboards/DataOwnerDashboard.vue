<template>
  <h2 class="d-flex flex-column flex-md-row justify-space-between">
    Dashboard
    <v-btn
      class="mt-4 mt-md-0"
      color="primary"
      :to="{ name: 'DatasetNewPage' }"
      >Add Dataset</v-btn
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
      <v-row>
        <v-col>
          <MySubscriptionsCard />
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <MyDataCard />
        </v-col>
      </v-row>
    </v-col>
  </v-row>
  <v-row>
    <v-col>
      <MyRequestsCard />
    </v-col>
  </v-row>
  <QaHelpersSection />
</template>

<script lang="ts" setup>
import DatasetSearchCard from "@/components/dashboard-widgets/DatasetSearchCard.vue"
import MySubscriptionsCard from "@/components/dashboard-widgets/MySubscriptionsCard.vue"
import MyDataCard from "@/components/dashboard-widgets/MyDataCard.vue"
import MyRequestsCard from "@/components/dashboard-widgets/MyRequestsCard.vue"
import QaHelpersSection from "@/components/dashboard-widgets/QaHelpersSection.vue"
</script>
