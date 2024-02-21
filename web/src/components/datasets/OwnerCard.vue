<template>
  <v-card>
    <v-card-title>Owner</v-card-title>

    <v-card-text>
      <!-- TODO: make the skeleton loader an external component that matches the form -->
      <v-skeleton-loader
        v-if="isNil(datasetStewardship)"
        type="card"
      />
      <v-form
        v-else
        class="d-flex flex-column mt-6"
      >
        <v-row>
          <v-col
            cols="12"
            md="6"
          >
            <UserAttributeTextField
              :model-value="datasetStewardship.ownerId"
              label="Owner Name"
              variant="outlined"
              readonly
            />
          </v-col>
          <v-col
            cols="12"
            md="6"
          >
            <UserAttributeTextField
              :model-value="datasetStewardship.ownerId"
              label="Owner Position"
              attribute="position"
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
            <UserAttributeTextField
              :model-value="datasetStewardship.supportId"
              label="Support Name"
              attribute="displayName"
              variant="outlined"
              readonly
            />
          </v-col>
          <v-col
            cols="12"
            md="6"
          >
            <UserAttributeTextField
              :model-value="datasetStewardship.supportId"
              label="Support Email"
              attribute="email"
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
            <UserAttributeTextField
              :model-value="datasetStewardship.supportId"
              label="Support Position"
              attribute="position"
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
            <UserGroupAutocomplete
              :model-value="datasetStewardship.departmentId"
              :type="UserGroupTypes.DEPARTMENT"
              :parent-id="null"
              item-value="id"
              item-title="name"
              label="Department"
              variant="outlined"
              readonly
            />
          </v-col>
          <v-col
            cols="12"
            md="6"
          >
            <UserGroupAutocomplete
              :model-value="datasetStewardship.divisionId"
              :type="UserGroupTypes.DIVISION"
              :parent-id="datasetStewardship.departmentId"
              item-value="id"
              item-title="name"
              label="Division"
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
            <UserGroupAutocomplete
              :model-value="datasetStewardship.branchId"
              :type="UserGroupTypes.BRANCH"
              :parent-id="datasetStewardship.divisionId"
              item-value="id"
              item-title="name"
              label="Branch"
              variant="outlined"
              readonly
            />
          </v-col>
          <v-col
            cols="12"
            md="6"
          >
            <UserGroupAutocomplete
              :model-value="datasetStewardship.unitId"
              :type="UserGroupTypes.UNIT"
              :parent-id="datasetStewardship.branchId"
              item-value="id"
              item-title="name"
              label="Unit"
              variant="outlined"
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

import { UserGroupTypes } from "@/api/user-groups-api"

import useDataset from "@/use/use-dataset"

import UserAttributeTextField from "@/components/users/UserAttributeTextField.vue"
import UserGroupAutocomplete from "@/components/user-groups/UserGroupAutocomplete.vue"

const props = defineProps({
  slug: {
    type: String,
    required: true,
  },
})

const { slug } = toRefs(props)
const { dataset } = useDataset(slug)
const datasetStewardship = computed(() => dataset.value?.stewardship)
</script>
