<template>
  <v-app>
    <v-container>
      Return to <router-link :to="{ name: returnTo.name }">{{ returnTo.title }}</router-link>

      <v-row class="mt-5">
        <v-col cols="12">
          <v-card
            outlined
            class="pa-3"
            :loading="isLoading"
          >
            <v-card-title
              >Environment Information
              <v-btn
                class="ma-0 ml-1"
                icon
                size="small"
                color="green"
                title="refresh"
                @click="refresh"
              >
                <v-icon>mdi-cached</v-icon>
              </v-btn>
            </v-card-title>
            <v-list dense>
              <v-list-item> Release Tag: {{ status?.RELEASE_TAG || "loading..." }} </v-list-item>
              <v-list-item>
                Git Commit Hash: {{ status?.GIT_COMMIT_HASH || "loading..." }}
              </v-list-item>
            </v-list>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-app>
</template>

<script lang="ts" setup>
import { computed, onMounted } from "vue"
import { useAuth0 } from "@auth0/auth0-vue"

import { useStatus } from "@/use/use-status"

const { isAuthenticated } = useAuth0()
const { status, isLoading, refresh } = useStatus()

const returnTo = computed<{ name: string; title: string }>(() => {
  if (isAuthenticated.value) {
    return {
      name: "DashboardPage",
      title: "Dashboard",
    }
  }

  return {
    name: "SignInPage",
    title: "Sign In",
  }
})

onMounted(async () => {
  await refresh()
})
</script>
