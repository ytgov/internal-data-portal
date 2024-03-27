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
      <slot name="prepend-item">
        <v-list-item><em>Search for a user ...</em></v-list-item>
      </slot>
    </template>
    <template
      v-for="slotName in dynamicSlots"
      #[slotName]="slotProps"
    >
      <slot
        :name="slotName"
        v-bind="slotProps"
      ></slot>
    </template>
    <template
      v-for="slotName in staticSlots"
      #[slotName]
    >
      <slot :name="slotName"></slot>
    </template>
  </v-autocomplete>
</template>

<script lang="ts" setup>
import { ref, watch } from "vue"
import { debounce, isEmpty, isNil } from "lodash"

import useUsers from "@/use/use-users"

const dynamicSlots = [
  "append",
  "append-inner",
  "chip",
  "details",
  "item",
  "label",
  "loader",
  "message",
  "prepend",
  "prepend-inner",
  "selection",
] as const
const staticSlots = ["append-item", "clear", "no-data"] as const

const props = defineProps<{
  modelValue: number | null | undefined
}>()

const emit = defineEmits<{
  "update:modelValue": [value: number | undefined]
}>()

const searchToken = ref("")
const usersQuery = ref<{
  where?: Record<string, unknown>
  perPage: number
}>({
  perPage: 5,
})
const { users, isLoading, search, refresh } = useUsers(usersQuery, { isWatchEnabled: false })

watch(
  () => props.modelValue,
  async (newValue) => {
    if (isNil(newValue)) return

    const isExistingUser = users.value.some((user) => user.id === newValue)
    if (isExistingUser) return

    usersQuery.value.where = {
      id: newValue,
    }
    await refresh()
    delete usersQuery.value.where
  },
  {
    immediate: true,
  }
)

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
