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
      v-for="slotName in slotsNamesToPassThrough"
      #[slotName]="slotProps"
    >
      <slot
        :name="slotName"
        v-bind="slotProps"
      ></slot>
    </template>
  </v-autocomplete>
</template>

<script lang="ts" setup>
import { ref, watch } from "vue"
import { debounce, isEmpty, isNil } from "lodash"

import useUsers from "@/use/use-users"

import { VAutocomplete } from "vuetify/lib/components/index.mjs"

const slotsNamesToPassThrough: (keyof VAutocomplete["$slots"])[] = [
  "append-inner",
  "append-item",
  "append",
  "chip",
  "clear",
  "details",
  "item",
  "label",
  "loader",
  "message",
  "no-data",
  "prepend-inner",
  "prepend",
  "selection",
]

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
