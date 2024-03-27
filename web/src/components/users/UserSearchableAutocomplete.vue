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
    <template
      v-for="slotName in slotsNamesToPassThrough"
      #[slotName]="slotProps"
    >
      <slot
        v-if="slotName === 'prepend-item'"
        :name="slotName"
        v-bind="slotProps"
      >
        <v-list-item><em>Search for a user ...</em></v-list-item>
      </slot>
      <slot
        v-else
        :name="slotName"
        v-bind="slotProps"
      ></slot>
    </template>
  </v-autocomplete>
</template>

<script lang="ts" setup>
import { computed, ref, useSlots, watch } from "vue"
import { debounce, isEmpty, isNil } from "lodash"

import useUsers from "@/use/use-users"

// Slot passthrough with TypeScript
import type { VAutocomplete } from "vuetify/lib/components/index.mjs"

type WrappedSlotNames = keyof VAutocomplete["$slots"]
const wrappedSlotNames = new Set<WrappedSlotNames>([
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
  "prepend-item",
  "prepend",
  "selection",
])

const slots = useSlots()

const slotsNamesToPassThrough = computed(() => {
  return Object.keys(slots).filter((slotName): slotName is WrappedSlotNames =>
    wrappedSlotNames.has(slotName as WrappedSlotNames)
  )
})
// End of slot passthrough with TypeScript

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
