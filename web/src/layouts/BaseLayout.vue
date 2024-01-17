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
      >{{ APPLICATION_NAME }}</v-app-bar-title
    >

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

      <span class="text-body-2"> {{ username }} </span>

      <v-menu offset-y>
        <template #activator="{ props }">
          <v-btn
            icon="mdi-dots-vertical"
            color="primary"
            v-bind="props"
          ></v-btn>
        </template>

        <v-list density="compact">
          <v-list-item :to="{ name: 'StatusPage' }">
            <template #prepend>
              <v-icon>mdi-clock</v-icon>
            </template>
            <v-list-item-title class="text-body-2">{{ status?.RELEASE_TAG || 'loading...' }}</v-list-item-title>
          </v-list-item>
          <v-list-item @click="logoutWrapper">
            <template #prepend>
              <v-icon>mdi-exit-run</v-icon>
            </template>
            <v-list-item-title class="text-body-2">Sign out</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </template>
  </v-app-bar>

  <v-main>
    <!-- Provides the application content the proper gutter -->
    <!-- height 100% causes the main content to fill the entire page -->
    <v-container
      fluid
      class="h-100"
    >
      <router-view></router-view>
    </v-container>
  </v-main>
</template>

<script lang="ts" setup>
import { computed, onMounted } from "vue"
import { useAuth0 } from "@auth0/auth0-vue"

import { APPLICATION_NAME } from "@/config"
import { useStatus } from "@/use/use-status"
import { useCurrentUser } from "@/use/use-current-user"

const { logout } = useAuth0()

const { currentUser } = useCurrentUser()
const { status, refresh } = useStatus()

const username = computed(() => {
  if (currentUser.value === null) return "loading..."

  const { email } = currentUser.value
  return email.substring(0, email.indexOf("@"))
})

onMounted(async () => {
  await refresh()
})

async function logoutWrapper() {
  await logout({
    logoutParams: {
      // I would prefer to redirect to /sign-in here, but that doesn't seem to work?
      returnTo: window.location.origin,
    },
  })
}
</script>
