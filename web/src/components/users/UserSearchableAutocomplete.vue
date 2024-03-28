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
      v-if="!slotsNamesToPassThrough.includes('prepend-item')"
      #prepend-item
    >
      <v-list-item><em>Search for a user ...</em></v-list-item>
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
import { ref, toRefs, watch } from "vue"
import { assign, debounce, isEmpty, isNil } from "lodash"

import useUser from "@/use/use-user"
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

const { modelValue: userId } = toRefs(props)
const { user } = useUser(userId, { withDeleted: true })
const { users, isLoading, search } = useUsers(usersQuery, { isWatchEnabled: false })

watch<[number | null | undefined, User | null, User[]], true>(
  () => [props.modelValue, user.value, users.value],
  async ([newUserId, newUser, newUsers]) => {
    if (isNil(newUserId)) return
    if (isNil(newUser)) return

    const isExistingUser = newUsers.some((user) => user.id === newUserId)
    if (isExistingUser) return

    users.value.unshift(newUser)
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
  const isStaleSearch =
    users.value.some(
      (user) => user[searchAttribute] === newSearchToken || user.id === parseInt(newSearchToken)
    ) || props.modelValue === parseInt(newSearchToken)
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
