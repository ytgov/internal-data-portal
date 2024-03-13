<template>
  <v-skeleton-loader v-if="isNil(currentUser)" />
  <v-container v-else>
    <h2 class="d-flex justify-space-between mb-3">
      My Profile

      <v-btn
        color="primary"
        :to="{ name: 'ProfileEditPage' }"
      >
        Edit
      </v-btn>
    </h2>

    <v-row>
      <v-col
        cols="12"
        md="6"
      >
        <v-text-field
          :model-value="currentUser.firstName"
          label="First name"
          append-inner-icon="mdi-lock"
          variant="outlined"
          readonly
        />
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <v-text-field
          :model-value="currentUser.lastName"
          label="Last name"
          append-inner-icon="mdi-lock"
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
        <v-text-field
          :model-value="currentUser.email"
          label="Email"
          append-inner-icon="mdi-lock"
          variant="outlined"
          readonly
        />
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <v-text-field
          :model-value="currentUser.position"
          label="Position"
          append-inner-icon="mdi-lock"
          variant="outlined"
          readonly
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
          append-inner-icon="mdi-lock"
          variant="outlined"
          readonly
        />
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <v-text-field
          :model-value="currentUser.division"
          label="Division"
          append-inner-icon="mdi-lock"
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
        <v-text-field
          :model-value="currentUser.branch"
          label="Branch"
          append-inner-icon="mdi-lock"
          variant="outlined"
          readonly
        />
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <v-text-field
          :model-value="currentUser.unit"
          label="Unit"
          append-inner-icon="mdi-lock"
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
  </v-container>
</template>

<script setup lang="ts">
import { isNil } from "lodash"
import { useI18n } from "vue-i18n"

import { useBreadcrumbs } from "@/use/use-breadcrumbs"
import { useCurrentUser } from "@/use/use-current-user"

const { t } = useI18n()
const { currentUser } = useCurrentUser()

function formatRole(roleType: string) {
  return t(`roles.role_types.${roleType}`, roleType)
}

const { setBreadcrumbs } = useBreadcrumbs()

setBreadcrumbs([
  {
    title: "Profile",
    to: { name: "ProfilePage" },
  },
])
</script>
