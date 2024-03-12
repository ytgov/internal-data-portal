<template>
  <v-skeleton-loader v-if="isNil(currentUser)" />
  <v-container v-else>
    <h2 class="d-flex flex-column flex-md-row justify-space-between mb-3">
      My Profile

      <div class="d-flex justify-space-between mt-4 mb-3 my-md-0">
        <v-btn
          color="primary"
          variant="outlined"
          :to="{ name: 'ProfilePage' }"
        >
          Back
        </v-btn>
        <v-btn
          class="ml-md-3"
          title="Sync profile with external directory"
          color="primary"
          append-icon="mdi-sync"
          @click="sync"
        >
          Sync
        </v-btn>
      </div>
    </h2>

    <v-row>
      <v-col
        cols="12"
        md="6"
      >
        <v-text-field
          :model-value="currentUser.firstName"
          label="First name"
          variant="outlined"
        />
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <v-text-field
          :model-value="currentUser.lastName"
          label="Last name"
          variant="outlined"
        />
      </v-col>
    </v-row>

    <v-row>
      <v-col
        cols="12"
        md="6"
      >
        <v-text-field
          :model-value="currentUser.email"
          label="Email"
          variant="outlined"
        />
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <v-text-field
          :model-value="currentUser.position"
          label="Position"
          variant="outlined"
        />
      </v-col>
    </v-row>

    <v-divider class="my-6"></v-divider>

    <v-row>
      <v-col
        cols="12"
        md="6"
      >
        <v-text-field
          :model-value="currentUser.department"
          label="Department"
          variant="outlined"
        />
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <v-text-field
          :model-value="currentUser.division"
          label="Division"
          variant="outlined"
        />
      </v-col>
    </v-row>

    <v-row>
      <v-col
        cols="12"
        md="6"
      >
        <v-text-field
          :model-value="currentUser.branch"
          label="Branch"
          variant="outlined"
        />
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <v-text-field
          :model-value="currentUser.unit"
          label="Unit"
          variant="outlined"
        />
      </v-col>
    </v-row>

    <v-row>
      <v-col
        cols="12"
        md="6"
      >
        <h3 class="mb-1">Roles</h3>

        <v-chip
          v-for="(roleType, index) in currentUser.roleTypes"
          :key="index"
          class="ma-2"
          color="info"
          size="large"
        >
          {{ formatRole(roleType) }}
        </v-chip>
      </v-col>
    </v-row>
    <v-row>
      <v-spacer />
      <v-col class="d-flex justify-end">
        <v-btn
          color="error"
          variant="outlined"
          :to="{ name: 'ProfilePage' }"
        >
          Cancel
        </v-btn>
        <!-- TODO: add ability to request update of yukon government directory information during save -->
        <v-btn
          class="ml-md-3"
          color="success"
          @click="save"
        >
          Save
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { isNil } from "lodash"
import { useI18n } from "vue-i18n"

import { useBreadcrumbs } from "@/use/use-breadcrumbs"
import { useCurrentUser } from "@/use/use-current-user"

const { t } = useI18n()
const { currentUser, save, sync } = useCurrentUser()

function formatRole(roleType: string) {
  return t(`roles.role_types.${roleType}`, roleType)
}

const { setBreadcrumbs } = useBreadcrumbs()

setBreadcrumbs([
  {
    title: "Profile",
    to: { name: "ProfilePage" },
  },
  {
    title: "Edit",
    to: { name: "ProfileEditPage" },
  },
])
</script>
