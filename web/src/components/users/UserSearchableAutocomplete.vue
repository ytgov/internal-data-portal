<template>
  <v-autocomplete
    :model-value="modelValue"
    :items="users"
    :loading="isLoading"
    label="User by Email"
    item-value="id"
    item-title="email"
    auto-select-first
    v-bind="$attrs"
    @update:model-value="updateModelValue"
    @update:search="debouncedSearch"
  />
</template>

<script lang="ts" setup>
import { ref } from "vue"
import { debounce, isEmpty } from "lodash"

import useUsers from "@/use/use-users"

defineProps<{
  modelValue: number | null | undefined
}>()

const usersQuery = ref({
  perPage: 100,
})
const { users, isLoading, search, refresh } = useUsers(usersQuery)

const emit = defineEmits<{
  "update:modelValue": [value: number | undefined]
}>()

function updateModelValue(value: number | undefined) {
  emit("update:modelValue", value)
}

const debouncedSearch = debounce((searchToken: string) => {
  if (isEmpty(searchToken)) {
    usersQuery.value.perPage = 100
    refresh()
    return
  }

  usersQuery.value.perPage = 10
  search(searchToken)
}, 300)
</script>
