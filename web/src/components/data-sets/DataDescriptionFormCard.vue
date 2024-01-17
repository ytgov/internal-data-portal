<template>
  <v-card>
    <v-card-title>Data Description</v-card-title>
    <v-card-text>
      <v-form class="d-flex">
        <v-col cols="6">
          <v-row>
            <v-col col="8">
              <v-text-field
                label="Name"
                variant="outlined"
              />
            </v-col>
            <v-col
              cols="4"
              class="d-flex justify-center mt-3"
            >
              <v-btn
                color="primary"
                variant="outlined"
                >Add API Link</v-btn
              >
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12">
              <v-textarea
                label="Description"
                variant="outlined"
                rows="6"
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-checkbox
                label="inactive"
                variant="Spatial?"
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="3">
              <v-checkbox
                label="Live data?"
                variant="outlined"
              />
            </v-col>
            <v-col cols="9"> TODO: datepicker </v-col>
          </v-row>
        </v-col>
        <v-col cols="6">
          <v-row>
            <v-col cols="3">
              <v-checkbox
                label="inactive"
                variant="outlined"
              />
            </v-col>
            <v-col cols="9"> TODO: datepicker </v-col>
          </v-row>
          <v-row>
            <v-col cols="12">
              <v-textarea
                label="Terms of Use"
                variant="outlined"
                rows="4"
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12">
              <v-textarea
                label="Credits"
                variant="outlined"
                rows="4"
              />
            </v-col>
          </v-row>
        </v-col>
      </v-form>
    </v-card-text>
  </v-card>
</template>
