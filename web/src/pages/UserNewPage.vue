<template>
  <v-skeleton-loader v-if="isNil(currentUser)" />
  <v-container v-else>
    <h2 class="d-flex flex-column flex-md-row justify-space-between mb-3">
      Create User

      <div class="d-flex justify-space-between mt-4 mb-3 my-md-0">
        <v-btn
          color="primary"
          variant="outlined"
          :to="{ name: 'UsersPage' }"
        >
          Back
        </v-btn>
      </div>
    </h2>

    TODO: replace with user create form
    <UserEditForm
      class="mt-10"
      :user-id="currentUser.id"
      :cancel-button-options="{ to: { name: 'UsersPage' } }"
      @saved="refresh"
    />
  </v-container>
</template>

<script setup lang="ts">
import { isNil } from "lodash"

import useBreadcrumbs from "@/use/use-breadcrumbs"
import useCurrentUser from "@/use/use-current-user"

import UserEditForm from "@/components/users/UserEditForm.vue"

const { currentUser, refresh } = useCurrentUser()

const { setBreadcrumbs } = useBreadcrumbs()

setBreadcrumbs([
  {
    title: "All Users",
    to: { name: "UsersPage" },
  },
  {
    title: "New",
    to: {
      name: "UserNewPage",
    },
  },
])
</script>
