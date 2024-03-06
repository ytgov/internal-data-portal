<template>
  <h2 class="d-flex flex-column flex-md-row justify-space-between">
    Dashboard
    <div class="d-flex flex-column flex-md-row mt-4 mt-md-0">
      <v-btn
        color="primary"
        variant="outlined"
        :to="{ name: 'DatasetsPage' }"
      >
        View Datasets
      </v-btn>
      <v-btn
        class="ml-md-4 mt-4 mt-md-0"
        color="primary"
        :to="{ name: 'DatasetNewPage' }"
        >Create Dataset</v-btn
      >
    </div>
  </h2>
  <v-row class="mt-6">
    <v-col
      cols="12"
      md="6"
    >
      TODO: DatasetSearchCard
      <v-skeleton-loader
        type="card"
        boilerplate
      />
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
