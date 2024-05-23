<template>
  <v-card>
    <v-card-title class="d-flex justify-space-between align-center">
      Data Description

      <!-- TODO: consider making this a separate component -->
      <div>
        <v-progress-circular
          v-if="isNil(dataset) || isNil(policy) || isNil(currentUser)"
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
        <v-chip
          v-else-if="
            !isNil(currentUserAccessGrant) &&
            currentUserAccessGrant.accessType === AccessTypes.OPEN_ACCESS
          "
          color="info"
        >
          Open Access
        </v-chip>
        <v-chip
          v-else-if="
            !isNil(currentUserAccessGrant) &&
            [AccessTypes.SELF_SERVE_ACCESS, AccessTypes.SCREENED_ACCESS].includes(
              currentUserAccessGrant.accessType
            ) &&
            !isNil(currentUserAccessRequest) &&
            !isNil(currentUserAccessRequest.approvedAt)
          "
          color="info"
        >
          Subscribed
        </v-chip>
        <v-chip
          v-else-if="!isNil(currentUserAccessRequest) && isNil(currentUserAccessRequest.approvedAt)"
          color="info"
        >
          Request Pending
        </v-chip>
        <AccessRequestCreateDialog
          v-else-if="
            !isNil(currentUserAccessGrant) &&
            [AccessTypes.SELF_SERVE_ACCESS, AccessTypes.SCREENED_ACCESS].includes(
              currentUserAccessGrant.accessType
            )
          "
          :dataset-id="dataset.id"
          :requestor-id="currentUser.id"
          :access-grant-id="currentUserAccessGrant.id"
          :access-type="currentUserAccessGrant.accessType"
          :is-project-description-required="currentUserAccessGrant.isProjectDescriptionRequired"
          @created="refresh"
        />
        <template v-else>
          <!-- Unexpected edge case for call-to-action button -->
        </template>
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
              append-inner-icon="mdi-lock"
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
              append-inner-icon="mdi-lock"
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
              append-inner-icon="mdi-lock"
              variant="outlined"
              rows="4"
              readonly
            />
            <v-textarea
              :model-value="dataset.credits"
              label="Credits"
              append-inner-icon="mdi-lock"
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
import { computed, toRefs } from "vue"
import { isNil } from "lodash"

import { type VForm } from "vuetify/lib/components/index.mjs"

import { AccessTypes } from "@/api/access-grants-api"
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
const { dataset, policy, refresh: refreshDataset } = useDataset(slug)
const { currentUser, fetch: refreshCurrentUser } = useCurrentUser()

const currentUserAccessGrant = computed(() => dataset.value?.currentUserAccessGrant)
const currentUserAccessRequest = computed(() => dataset.value?.currentUserAccessRequest)

function refresh() {
  refreshDataset()
  refreshCurrentUser()
}
</script>
