<template>
  <v-skeleton-loader
    v-if="isLoading"
    type="chip"
  />
  <v-chip v-else-if="isNil(user)">
    {{ `Unknown User#${userId}` }}
  </v-chip>
  <v-chip v-else>
    {{ user.email }}
  </v-chip>
</template>

<script lang="ts" setup>
import { toRefs } from "vue"
import { isNil } from "lodash"

import useUser from "@/use/use-user"

const props = defineProps<{
  userId: number
}>()

const { userId } = toRefs(props)
const { user, isLoading } = useUser(userId)
</script>
