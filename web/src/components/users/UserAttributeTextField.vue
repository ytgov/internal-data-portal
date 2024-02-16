<template>
  <v-text-field
    label="User"
    v-bind="$attrs"
    :model-value="fieldValue"
    :loading="isLoading"
    readonly
  />
</template>

<script lang="ts" setup>
import { computed, toRefs } from "vue"
import { isNil } from "lodash"

import useUser, { type User } from "@/use/use-user"

const props = withDefaults(
  defineProps<{
    modelValue: number
    itemTitle: keyof User
  }>(),
  {
    itemTitle: "displayName",
  }
)

const { modelValue: userId } = toRefs(props)
const { user, isLoading } = useUser(userId)

const fieldValue = computed(() => {
  if (isLoading.value) {
    return "loading..."
  }

  if (isNil(user.value)) {
    return `Unknown User#${props.modelValue}`
  }

  return user.value[props.itemTitle]
})
</script>
