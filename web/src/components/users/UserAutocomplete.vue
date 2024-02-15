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
  />
</template>

<script lang="ts" setup>
import useUsers from "@/use/use-users"

defineProps<{
  modelValue: number | null | undefined
}>()

const { users, isLoading } = useUsers()

const emit = defineEmits<{
  "update:modelValue": [value: number | undefined]
}>()

function updateModelValue(value: number | undefined) {
  emit("update:modelValue", value)
}
</script>
