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

export type AttributeType = keyof User &
  ("firstName" | "lastName" | "email" | "displayName" | "position")

const props = withDefaults(
  defineProps<{
    modelValue: number | null | undefined
    attribute?: AttributeType
  }>(),
  {
    attribute: "displayName",
  }
)

const { modelValue: userId } = toRefs(props)
const { user, isLoading } = useUser(userId)

const fieldValue = computed(() => {
  if (isNil(props.modelValue)) {
    return ""
  }

  if (isLoading.value) {
    return "loading..."
  }

  if (isNil(user.value)) {
    return `Unknown User#${props.modelValue}`
  }

  return user.value[props.attribute]
})
</script>
