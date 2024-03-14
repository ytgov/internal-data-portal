<template>
  <v-container>
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

    <UserCreateForm class="mt-10" />
  </v-container>
</template>

<script setup lang="ts">
import useBreadcrumbs from "@/use/use-breadcrumbs"

import UserCreateForm from "@/components/users/UserCreateForm.vue"

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
