<template>
  <v-app-bar
    app
    color="#fff"
    flat
    height="70"
    style="left: 0; border-bottom: 3px #f3b228 solid"
  >
    <img
      src="/yukon.svg"
      style="margin: -10px 85px 0 14px"
      height="44"
    />
    <v-app-bar-title
      class="pt-0 font-weight-bold"
      style="margin-left: -20px"
    >
      <h1>{{ APPLICATION_NAME }}</h1>
    </v-app-bar-title>

    <template #append>
      <v-btn
        color="primary"
        class="mr-1"
        :to="{ name: 'DashboardPage' }"
        icon="mdi-home"
      ></v-btn>

      <v-divider
        class="mr-5"
        vertical
        inset
      />

      <v-btn
        class="text-body-1"
        :to="{ name: 'ProfilePage' }"
        :active="isViewingProfilePage"
        append-icon="mdi-account-arrow-right-outline"
        variant="text"
      >
        {{ username }}
      </v-btn>

      <KebabMenu />
    </template>
  </v-app-bar>

  <v-main>
    <BaseBreadcrumbs />

    <!-- Provides the application content the proper gutter -->
    <!-- height 100% causes the main content to fill the entire page -->
    <v-container
      fluid
      class="h-100 pt-0"
    >
      <router-view></router-view>
    </v-container>
  </v-main>
</template>

<script lang="ts" setup>
import { computed } from "vue"
import { useRoute } from "vue-router"

import BaseBreadcrumbs from "@/components/BaseBreadcrumbs.vue"
import KebabMenu from "@/components/base-layout/KebabMenu.vue"

import { APPLICATION_NAME } from "@/config"
import { useCurrentUser } from "@/use/use-current-user"

const { currentUser } = useCurrentUser()

const username = computed(() => {
  if (currentUser.value === null) return "loading..."

  const { email } = currentUser.value
  return email.substring(0, email.indexOf("@"))
})

const route = useRoute()
const isViewingProfilePage = computed(() => {
  return ["ProfilePage", "ProfileEditPage"].includes(route.name as string)
})
</script>
