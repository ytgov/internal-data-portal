<template>
  <v-card>
    <v-card-title class="d-flex justify-space-between align-center">
      Data Description

      <div>
        <v-progress-circular
          v-if="
            isNil(dataset) ||
            isNil(policy) ||
            isNil(currentUser) ||
            isNil(dataset.accessibleByAccessGrant)
          "
          indeterminate
          color="primary"
          size="36"
        />
        <v-btn
          v-else-if="policy.update"
          color="primary"
          :to="{
            name: 'DatasetDescriptionManagePage',
            params: { slug },
          }"
        >
          Edit
        </v-btn>
        <AccessRequestCreateDialog
          v-else
          :dataset-id="dataset.id"
          :access-grant-id="dataset.accessibleByAccessGrant.id"
          :requestor-id="currentUser.id"
        />
      </div>
    </v-card-title>
    <v-card-text>
      <!-- TODO: make the skeleton loader an external component that matches the form -->
      <v-skeleton-loader
        v-if="isNil(dataset)"
        type="card"
      />
      <v-form
        v-else
        class="mt-6"
      >
        <v-row>
          <v-col
            cols="12"
            md="5"
          >
            <v-text-field
              :model-value="dataset.name"
              label="Name"
              variant="outlined"
              readonly
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col
            cols="12"
            md="6"
          >
            <v-textarea
              :model-value="dataset.description"
              label="Description"
              variant="outlined"
              rows="6"
              readonly
            />
            <v-checkbox
              :model-value="dataset.isSpatialData"
              label="Spatial?"
              hide-details
              readonly
            />
            <v-checkbox
              :model-value="dataset.isLiveData"
              label="Live data?"
              hide-details
              readonly
            />
          </v-col>
          <v-col
            cols="12"
            md="6"
          >
            <v-textarea
              :model-value="dataset.termsOfUse"
              label="Terms of Use"
              variant="outlined"
              rows="4"
              readonly
            />
            <v-textarea
              :model-value="dataset.credits"
              label="Credits"
              variant="outlined"
              rows="4"
              readonly
            />
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
import { toRefs } from "vue"
import { isNil } from "lodash"

import { type VForm } from "vuetify/lib/components/index.mjs"

import useDataset from "@/use/use-dataset"
import useCurrentUser from "@/use/use-current-user"

import AccessRequestCreateDialog from "@/components/access-requests/AccessRequestCreateDialog.vue"

const props = defineProps({
  slug: {
    type: String,
    required: true,
  },
})

const { slug } = toRefs(props)
const { dataset, policy } = useDataset(slug)
const { currentUser } = useCurrentUser()
</script>
