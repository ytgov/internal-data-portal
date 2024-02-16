<template>
  <v-autocomplete
    :model-value="modelValue"
    :items="users"
    :loading="isLoading"
    label="User by Email"
    item-value="id"
    item-title="email"
    prepend-inner-icon="mdi-magnify"
    auto-select-first
    v-bind="$attrs"
    @update:model-value="updateModelValue"
    @update:search="debouncedSearch"
    @click:clear="clearUsers"
  >
    <template #prepend-item>
      <v-list-item><em>Search for a user ...</em></v-list-item>
    </template>
  </v-autocomplete>
</template>

<script lang="ts" setup>
import { ref } from "vue"
import { debounce, isEmpty } from "lodash"

import useUsers from "@/use/use-users"

defineProps<{
  modelValue: number | null | undefined
}>()

const emit = defineEmits<{
  "update:modelValue": [value: number | undefined]
}>()

const searchToken = ref("")
const usersQuery = ref({
  perPage: 5,
})
const { users, isLoading, search } = useUsers(usersQuery, { isWatchEnabled: false })

function updateModelValue(value: number | undefined) {
  emit("update:modelValue", value)
}

const debouncedSearch = debounce((newSearchToken: string) => {
  const isStaleSearch = users.value.some((user) => user.email === newSearchToken)
  if (isStaleSearch) return

  searchToken.value = newSearchToken
  if (isEmpty(searchToken.value)) return

  search(searchToken.value)
}, 300)

function clearUsers() {
  users.value = []
}
</script>
