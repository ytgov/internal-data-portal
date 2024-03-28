<template>
  <v-autocomplete
    v-model:search="searchToken"
    :model-value="modelValue"
    :items="users"
    :loading="isLoading"
    label="User by Email"
    item-value="id"
    :item-title="itemTitle"
    prepend-inner-icon="mdi-magnify"
    auto-select-first
    v-bind="$attrs"
    @update:model-value="updateModelValue"
    @update:search="debouncedSearchWrapper"
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
import { ref, watch } from "vue"
import { assign, debounce, isEmpty, isNil } from "lodash"

import useUsers, { type UsersFilters, type User } from "@/use/use-users"
import useVuetifySlotNamesPassThrough from "@/use/use-vuetify-slot-names-pass-through"

import { VAutocomplete } from "vuetify/lib/components/index.mjs"

type UserAttributes = keyof User

const props = withDefaults(
  defineProps<{
    modelValue: number | null | undefined
    itemTitle?: UserAttributes
    filters?: UsersFilters
  }>(),
  {
    itemTitle: "email",
    filters: () => ({}),
  }
)

const emit = defineEmits<{
  "update:modelValue": [value: number | undefined]
}>()

const searchToken = ref("")
const usersQuery = ref<{
  where?: Record<string, unknown>
  filters?: UsersFilters
  perPage: number
}>({
  perPage: 5,
  filters: props.filters,
})

watch(
  () => props.filters,
  (newValue) => {
    assign(usersQuery.value, { filters: newValue })
  }
)

const { users, isLoading, search, refresh } = useUsers(usersQuery, { isWatchEnabled: false })

watch(
  () => props.modelValue,
  async (newValue) => {
    if (isNil(newValue)) return

    const isExistingUser = users.value.some((user) => user.id === newValue)
    if (isExistingUser) return

    assign(usersQuery.value, { where: { id: newValue }, perPage: 1 })
    await refresh()
    assign(usersQuery.value, { where: undefined, perPage: 5 })
  },
  {
    immediate: true,
  }
)

function updateModelValue(value: number | undefined) {
  emit("update:modelValue", value)
}

const searchWrapper = (newSearchToken: string) => {
  const searchAttribute: UserAttributes = props.itemTitle
  const isStaleSearch = users.value.some(
    (user) => user[searchAttribute] === newSearchToken || user.id === Number(newSearchToken)
  )
  if (isStaleSearch) return

  searchToken.value = newSearchToken
  if (isEmpty(searchToken.value)) return

  search(searchToken.value)
}

const debouncedSearchWrapper = debounce(searchWrapper, 300)

function clearUsers() {
  users.value = []
}

const slotsNamesToPassThrough = useVuetifySlotNamesPassThrough<VAutocomplete>([
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
</script>
