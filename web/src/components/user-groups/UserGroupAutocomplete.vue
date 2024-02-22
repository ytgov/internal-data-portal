<template>
  <v-autocomplete
    :model-value="modelValue"
    :items="userGroups"
    item-value="id"
    item-title="name"
    label="User Group"
    auto-select-first
    @update:model-value="emit('update:modelValue', $event)"
  />
</template>

<!-- Special module scope required for exports -->
<script lang="ts">
export { UserGroupTypes } from "@/use/use-user-groups"
</script>

<script setup lang="ts">
import { computed } from "vue"

import useUserGroups, { UserGroupTypes } from "@/use/use-user-groups"

const props = withDefaults(
  defineProps<{
    modelValue: number | null | undefined
    type: UserGroupTypes
    parentId?: number | null
  }>(),
  {
    parentId: null,
  }
)

const emit = defineEmits(["update:modelValue"])

const userGroupsQuery = computed(() => {
  return {
    where: {
      type: props.type,
      parentId: props.parentId,
    },
  }
})
const { userGroups } = useUserGroups(userGroupsQuery)
</script>
